// UI labels for Unicode editor
var UNICODE_EDITOR_TITLE = "Unicode Text";
var UNICODE_EDITOR_SUBTITLE = "Modern Bengali Unicode";
var UNICODE_EDITOR_ID = "EDT";
var UNICODE_EDITOR_NAME = "textarea";


// ================================
// Bengali Unicode Textarea Input Handler
// Supports: Bijoy (2), Somewherein Phonetic (3), Avro Phonetic (4), Unijoy (5)
// ================================

(function() {
    // ------------------------------
    // Helper: Character Classification
    // ------------------------------
    const BENGALI_UNICODE_RANGE = /[\u0980-\u09FF]/;
    
    function IsBanglaSoroborno(ch) {
        return /[\u0985-\u0994]/.test(ch); // অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ
    }
    function IsBanglaBanjonborno(ch) {
        return /[\u0995-\u09B9]/.test(ch); // ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ
    }
    function IsBanglaKar(ch) {
        return /[\u09BE-\u09CC\u09D7]/.test(ch); // আ-কার, ই-কার, উ-কার, ঋ-কার, এ-কার, ঐ-কার, ও-কার, ঔ-কার, ৗ (দীর্ঘ উ)
    }
    function IsBanglaPreKar(ch) {
        return /[\u09C7\u09C8]/.test(ch); // এ-কার (ে) and ঐ-কার (ৈ) – these precede the consonant
    }
    function IsBanglaPostKar(ch) {
        return /[\u09BE\u09BF\u09C0\u09C1\u09C2\u09C3\u09C4\u09CB\u09CC\u09D7]/.test(ch); // other vowel signs
    }
    function IsBanglaHalant(ch) {
        return ch === '্'; // U+09CD
    }
    function IsBanglaNukta(ch) {
        return ch === '়'; // U+09BC
    }
    function IsBanglaFola(ch) {
        return /[্র্য]/.test(ch); // য-ফলা, র-ফলা, etc. – simplified
    }
    function IsBanglaDigit(ch) {
        return /[\u09E6-\u09EF]/.test(ch);
    }
    function IsSpace(ch) {
        return /\s/.test(ch);
    }

    // ------------------------------
    // Mapping between Sorborno and Kar
    // ------------------------------
    function MapKarToSorborno(kar) {
        const map = {
            'া': 'আ',
            'ি': 'ই',
            'ী': 'ঈ',
            'ু': 'উ',
            'ূ': 'ঊ',
            'ৃ': 'ঋ',
            'ে': 'এ',
            'ৈ': 'ঐ',
            'ো': 'ও',
            'ৌ': 'ঔ',
            'ৗ': 'ঔ'
        };
        return map[kar] || kar;
    }
    function MapSorbornoToKar(sorborno) {
        const map = {
            'আ': 'া',
            'ই': 'ি',
            'ঈ': 'ী',
            'উ': 'ু',
            'ঊ': 'ূ',
            'ঋ': 'ৃ',
            'এ': 'ে',
            'ঐ': 'ৈ',
            'ও': 'ো',
            'ঔ': 'ৌ'
        };
        return map[sorborno] || sorborno;
    }

    // ------------------------------
    // Text Manipulation Helpers (modern)
    // ------------------------------
    function Insert(field, ch) {
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const scroll = field.scrollTop;
        const value = field.value;
        field.value = value.slice(0, start) + ch + value.slice(end);
        field.selectionStart = field.selectionEnd = start + ch.length;
        field.scrollTop = scroll;
        field.focus();
    }

    function RemoveNInsert(field, replacement, deleteCount) {
        const start = field.selectionStart - deleteCount;
        const end = field.selectionEnd;
        const scroll = field.scrollTop;
        const value = field.value;
        field.value = value.slice(0, start) + replacement + value.slice(end);
        field.selectionStart = field.selectionEnd = start + replacement.length;
        field.scrollTop = scroll;
        field.focus();
    }

    // ------------------------------
    // State per textarea (encapsulated)
    // ------------------------------
    class BengaliEditorState {
        constructor() {
            this.lastChar = '';         // LCUNI
            this.lastKar = '';          // LC_KAR
            this.lastString = '';       // LC_STRING
            this.avroChaFlag = false;
            this.avroAPressFlag = false;
            this.englishMode = false;
            this.layout = 2;            // default Bijoy
        }
    }

    const editorStates = new WeakMap();

    // ------------------------------
    // Layout Maps (unchanged, but corrected typo in "Somewherein")
    // ------------------------------
    const bijoy_keyboard_map = {
        0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",
        a:"ৃ",A:"র্",d:"ি",D:"ী",s:"ু",S:"ূ",f:"া",F:"অ",g:"্",G:"।  ",
        h:"ব",H:"ভ",j:"ক",J:"খ",k:"ত",K:"থ",l:"দ",L:"ধ",z:"্র",Z:"্য",
        x:"ো",X:"ৗ",c:"ে",C:"ৈ",v:"র",V:"ল",b:"ন",B:"ণ",n:"স",N:"ষ",
        m:"ম",M:"শ",q:"ঙ",Q:"ং",w:"য",W:"য়",e:"ড",E:"ঢ",r:"প",R:"ফ",
        t:"ট",T:"ঠ",y:"চ",Y:"ছ",u:"জ",U:"ঝ",i:"হ",I:"ঞ",o:"গ",O:"ঘ",
        p:"ড়",P:"ঢ়","&":"ঁ","$":"৳","`":"‌","~":"‍","\\":"ৎ","|":"ঃ"
    };
    const somewherein_phonetic_keyboard_map = {
        0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",
        a:"া",A:"আ",d:"ড",D:"দ",s:"স",S:"ষ",f:"ফ",F:"ঋ",g:"গ",G:"ঘ",
        h:"হ",H:"ঃ",j:"জ",J:"ঝ",k:"ক",K:"খ",l:"ল",L:"খ",z:"য",Z:"ত",
        x:"ক্স",X:"ঢ",c:"চ",C:"ছ",v:"ভ",V:"ঠ",b:"ব",B:"ই",n:"ন",N:"ণ",
        m:"ম",M:"গ",q:"য়",Q:"ছ",w:"ৃ",W:"ঋ",e:"ে",E:"এ",r:"র",R:"ড়",
        t:"ট",T:"ত",y:"য়",Y:"্য",u:"ু",U:"উ",i:"ি",I:"ই",o:"ো",O:"ও",
        p:"প",P:"চ","&":"্","$":"৳","+":"্",".":"।","`":"‌","~":"‍","\\":"॥","|":"।"
    };
    const avro_phonetic_keyboard_map = {
        0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",
        o:"অ",a:"আ",A:"আ",i:"ই",I:"ঈ",u:"উ",U:"ঊ",e:"এ",E:"এ",O:"ও",
        d:"দ",D:"ড",s:"স",S:"শ",f:"ফ",g:"গ",h:"হ",H:"হ",j:"জ",J:"য",
        k:"ক",K:"ক",l:"ল",L:"ল",z:"য",Z:"্য",c:"চ",v:"ভ",V:"ভ",b:"ব",
        n:"ন",N:"ণ",m:"ম",y:"য়",w:"্ব",r:"র",R:"ড়",t:"ত",T:"ট",p:"প",
        $:"৳","+":"্",".":"।",":":"ঃ","^":"ঁ","`":"্"
    };
    const unijoy_keyboard_map = {
        0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",
        a:"ৃ",A:"র্",d:"ি",D:"ী",s:"ু",S:"ূ",f:"া",F:"অ",g:"্",G:"।",
        h:"ব",H:"ভ",j:"ক",J:"খ",k:"ত",K:"থ",l:"দ",L:"ধ",z:"্র",Z:"্য",
        x:"ো",X:"ৌ",c:"ে",C:"ৈ",v:"র",V:"ল",b:"ন",B:"ণ",n:"স",N:"ষ",
        m:"ম",M:"শ",q:"ঙ",Q:"ং",w:"য",W:"য়",e:"ড",E:"ঢ",r:"প",R:"ফ",
        t:"ট",T:"ঠ",y:"চ",Y:"ছ",u:"জ",U:"ঝ",i:"হ",I:"ঞ",o:"গ",O:"ঘ",
        p:"ড়",P:"ঢ়","&":"ঁ","$":"৳","`":"‌","~":"‍","^":"÷","*":"×","\\":"ৎ","|":"ঃ"
    };

    function mapUnicodeCharacter(layout, latinChar) {
        let map;
        switch(layout) {
            case 2: map = bijoy_keyboard_map; break;
            case 3: map = somewherein_phonetic_keyboard_map; break;
            case 4: map = avro_phonetic_keyboard_map; break;
            case 5: map = unijoy_keyboard_map; break;
            default: return latinChar;
        }
        return map[latinChar] !== undefined ? map[latinChar] : latinChar;
    }

    // ------------------------------
    // Layout switching UI helper (optional)
    // ------------------------------
    function syncLayoutSelect(layoutValue) {
        const select = document.getElementById('keyboard-layout');
        if (select) {
            select.value = String(layoutValue);
        }
        document.body.setAttribute('data-active-layout', String(layoutValue));
    }

    function updateLayoutStatus(state) {
        const names = ['', '', 'Bijoy', 'Somewherein Phonetic', 'Avro Phonetic', 'Unijoy'];
        const layoutName = names[state.layout] || 'English';
        if(window.updateKeyboardLayoutIndicator) {
            window.updateKeyboardLayoutIndicator(layoutName);
        }
        syncLayoutSelect(state.layout);
    }

    window.setKeyboardLayout = function(layoutValue) {
        const parsedLayout = Number(layoutValue);
        const normalizedLayout = [1,2,3,4,5].includes(parsedLayout) ? parsedLayout : 2;

        document.querySelectorAll('textarea.bengali-editor').forEach((field) => {
            const fieldState = editorStates.get(field);
            if (fieldState) {
                fieldState.layout = normalizedLayout;
                updateLayoutStatus(fieldState);
            }
        });

        if (document.activeElement && document.activeElement.matches('textarea.bengali-editor')) {
            const activeState = editorStates.get(document.activeElement);
            if (activeState) {
                activeState.layout = normalizedLayout;
                updateLayoutStatus(activeState);
            }
        }

        return normalizedLayout;
    };

    window.getKeyboardLayout = function() {
        const select = document.getElementById('keyboard-layout');
        const value = Number(select ? select.value : 2);
        return [1,2,3,4,5].includes(value) ? value : 2;
    };

    // ------------------------------
    // Core composition functions (ported & fixed)
    // ------------------------------
    function resetKarModifier(state) {
        state.lastKar = '';
        state.lastString = '';
    }

    function RefModification(e, state) {
        const field = e.target;
        let backtrack = 1;
        let lastBacktrackedChar = '';
        let consonantStack = '';
        let karFound = '';
        let needHalant = true;
        let backtrackStart = 0, selectionEnd = 0, scrollTop = 0;

        while(true) {
            backtrackStart = field.selectionStart - backtrack;
            selectionEnd = field.selectionEnd;
            scrollTop = field.scrollTop;
            if(backtrackStart < 0) { break; }
            const ch = field.value[backtrackStart];
            lastBacktrackedChar = ch;
            if(backtrack !== 1 && IsBanglaKar(ch)) break;
            if(backtrack === 1 && IsBanglaKar(ch)) karFound = ch;
            else if(IsBanglaSoroborno(ch) || IsBanglaDigit(ch) || IsSpace(ch)) break;
            else if(IsBanglaBanjonborno(ch)) {
                if(needHalant) consonantStack = ch + consonantStack;
                else break;
                needHalant = false;
            }
            else if(IsBanglaHalant(ch)) {
                consonantStack = ch + consonantStack;
                needHalant = true;
            }
            backtrack++;
            if(backtrack > 20) break; // safety
        }

        if(!lastBacktrackedChar) return;

        const replacement = lastBacktrackedChar + 'র্' + consonantStack + karFound;
        const start = backtrackStart;
        const end = selectionEnd;
        field.value = field.value.slice(0, start) + replacement + field.value.slice(end);
        field.selectionStart = field.selectionEnd = start + replacement.length;
        field.scrollTop = scrollTop;
        field.focus();
    }

    function OAndOuKarModification(e, state, ch) {
        const field = e.target;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const scroll = field.scrollTop;
        let replacement = ch;

        if(start > 0 && field.value[start - 1] === 'ে') {
            replacement = (ch === 'া') ? 'ো' : 'ৌ';
            field.value = field.value.slice(0, start - 1) + replacement + field.value.slice(end);
            field.selectionStart = field.selectionEnd = (start - 1) + replacement.length;
        } else {
            field.value = field.value.slice(0, start) + replacement + field.value.slice(end);
            field.selectionStart = field.selectionEnd = start + replacement.length;
        }
        field.scrollTop = scroll;
        field.focus();
    }

    function KarModification(e, state, ch) {
        const field = e.target;
        if(state.lastKar === state.lastChar || IsBanglaHalant(state.lastChar) || ch === '্র' || ch === '্য') {
            state.lastString += ch;
            RemoveNInsert(field, state.lastString + state.lastKar, state.lastString.length);
        } else if(ch === 'র্') {
            state.lastString = ch + state.lastString;
            RemoveNInsert(field, state.lastString + state.lastKar, state.lastString.length);
        } else if(IsBanglaHalant(ch)) {
            state.lastString += ch;
            Insert(field, ch);
        } else {
            Insert(field, ch);
            resetKarModifier(state);
        }
    }

    // Simplified versions of phonetic modifiers (some functions were overly complex; kept core logic)
    function IsSomewhereinPhoneticModifierCharacter(ch) {
        return 'হগঘণঃটোইিুুউরড়'.includes(ch);
    }
    function GetSomewhereinPhoneticModifiedCharacter(prev, ch) {
        const pairs = {
            'কহ':'খ','গহ':'ঘ','চহ':'চ','জহ':'ঝ','টহ':'ঠ','ডহ':'ঢ','তহ':'থ','দহ':'ধ','পহ':'ফ','বহ':'ভ',
            'সহ':'শ','ড়হ':'ঢ়','ণগ':'ঙ','নগ':'ং','ণঘ':'ঞ','ণণ':'ঁ','ঃঃ':'ঃ','টট':'ৎ','াো':'অ','িি':'ী',
            'ইই':'ঈ','ুু':'ূ','উউ':'ঊ','ওই':'ঐ','োি':'ৈ','ওউ':'ঔ','োু':'ৌ','ৃর':'ৃ','ঋড়':'ঋ'
        };
        const key = prev + ch;
        return pairs[key] || ch;
    }

    function IsAvroPhoneticModifierCharacter(ch) {
        return 'ঃোিু'.includes(ch) || IsBanglaSoroborno(ch) || IsBanglaBanjonborno(ch);
    }
    function GetAvroPhoneticModifiedCharacter(prev, ch, state) {
        const pairs = {
            'কহ':'খ','গহ':'ঘ','জহ':'ঝ','টহ':'ঠ','ডহ':'ঢ','তহ':'থ','দহ':'ধ','পহ':'ফ','বহ':'ভ','সহ':'শ','শহ':'ষ','ড়হ':'ঢ়',
            'ণগ':'ঙ','নগ':'ং','ণঘ':'ঞ','ঃঃ':'ঃ','টট':'ৎ','াো':'অ','িি':'ী','ুু':'ূ','উউ':'ঊ','ওই':'ঐ','োি':'ৈ','ওউ':'ঔ','োু':'ৌ','ৃর':'ৃ','ঋড়':'ঋ',
            'কক':'্ক','কখ':'্ক্খ' // simplified conjunct example
        };
        // Special Avro rules
        if(prev === 'চ' && ch === 'হ') {
            state.avroChaFlag = !state.avroChaFlag;
            return state.avroChaFlag ? 'ছ' : 'চ';
        }
        if(IsBanglaBanjonborno(prev) && ch === 'অ' && !state.avroAPressFlag) {
            state.avroAPressFlag = true;
            return prev;
        }
        if(IsBanglaBanjonborno(prev) && IsBanglaSoroborno(ch) && state.avroAPressFlag) {
            state.avroAPressFlag = false;
            return ch;
        }
        if(IsBanglaBanjonborno(prev) && IsBanglaSoroborno(ch))
            return MapSorbornoToKar(ch);
        if(IsBanglaBanjonborno(prev) && IsBanglaBanjonborno(ch) && !state.avroAPressFlag)
            return '্' + ch;
        const key = prev + ch;
        if(pairs[key]) return pairs[key];
        if(ch !== 'অ' && ch !== '্') state.avroAPressFlag = false;
        return ch;
    }

    function ProcessCharacter(e, state, latinChar, mappedChar) {
        const field = e.target;
        const prev = state.lastChar;
        // Special rule for ZWNJ + য-ফলা
        if(prev === '‌' && mappedChar === '্য') {
            RemoveNInsert(field, field.value.slice(-1) + '‌্য', 1);
            resetKarModifier(state);
            return;
        }
        if(state.layout === 2 && prev === 'র' && mappedChar === '্য') {
            RemoveNInsert(field, 'ব়্য', 1);
            resetKarModifier(state);
            return;
        }
        if(IsBanglaPostKar(mappedChar) || IsBanglaDigit(mappedChar)) resetKarModifier(state);
        if(prev === 'অ' && mappedChar === 'া') {
            RemoveNInsert(field, 'আ', 1);
            resetKarModifier(state);
        } else if(IsBanglaHalant(prev) && IsBanglaKar(mappedChar)) {
            RemoveNInsert(field, MapKarToSorborno(mappedChar), 1);
            resetKarModifier(state);
        } else if(state.layout !== 5 && IsBanglaNukta(prev) && (IsBanglaPostKar(mappedChar) || IsBanglaFola(mappedChar))) {
            RemoveNInsert(field, mappedChar + prev, 1);
            resetKarModifier(state);
        } else if(state.layout === 2 && IsBanglaPreKar(state.lastKar))
            KarModification(e, state, mappedChar);
        else if(state.layout === 3 && IsSomewhereinPhoneticModifierCharacter(mappedChar) && !IsSpace(prev)) {
            const mod = GetSomewhereinPhoneticModifiedCharacter(prev, mappedChar);
            if(mod !== mappedChar) {
                RemoveNInsert(field, mod, 1);
                resetKarModifier(state);
            } else Insert(field, mappedChar);
        } else if(state.layout === 4 && IsAvroPhoneticModifierCharacter(mappedChar) && !IsSpace(prev)) {
            const mod = GetAvroPhoneticModifiedCharacter(prev, mappedChar, state);
            if(mod !== mappedChar) {
                if(mod === prev) {
                    Insert(field, mappedChar);
                } else if(IsBanglaBanjonborno(prev) && mappedChar === 'হ') RemoveNInsert(field, mod, 1);
                else if(IsBanglaBanjonborno(prev) && IsBanglaBanjonborno(mappedChar)) Insert(field, mod);
                else if(IsBanglaKar(prev) && IsBanglaSoroborno(mappedChar)) Insert(field, mod);
                else if(mod === MapSorbornoToKar(mappedChar)) Insert(field, mod);
                else RemoveNInsert(field, mod, 1);
                resetKarModifier(state);
            } else Insert(field, mappedChar);
        } else if(state.layout !== 5 && mappedChar === 'র্')
            RefModification(e, state);
        else if(state.layout !== 5 && mappedChar === 'া')
            OAndOuKarModification(e, state, 'া');
        else if(state.layout !== 5 && mappedChar === 'ৗ')
            OAndOuKarModification(e, state, 'ৗ');
        else
            Insert(field, mappedChar);

        if(!IsBanglaHalant(prev) && IsBanglaPreKar(mappedChar)) state.lastKar = mappedChar;
        if(!(IsBanglaNukta(prev) && IsBanglaFola(mappedChar))) state.lastChar = mappedChar;
    }

    // ------------------------------
    // Keyboard event handlers
    // ------------------------------
    function onKeyDown(e) {
        const field = e.target;
        if(!field || field.tagName !== 'TEXTAREA') return true;
        let state = editorStates.get(field);
        if(!state) {
            state = new BengaliEditorState();
            editorStates.set(field, state);
        }
        const key = e.key;
        const code = e.keyCode || e.which;
        // Layout switching shortcuts (Ctrl+Alt+...)
        if(e.ctrlKey && e.altKey) {
            switch(key.toLowerCase()) {
                case 'e': state.layout = 1; updateLayoutStatus(state); e.preventDefault(); return false;
                case 'b': state.layout = (state.layout === 2) ? 1 : 2; updateLayoutStatus(state); e.preventDefault(); return false;
                case 'p': state.layout = (state.layout === 3) ? 1 : 3; updateLayoutStatus(state); e.preventDefault(); return false;
                case 'a': state.layout = (state.layout === 4) ? 1 : 4; updateLayoutStatus(state); e.preventDefault(); return false;
                case 'u': state.layout = (state.layout === 5) ? 1 : 5; updateLayoutStatus(state); e.preventDefault(); return false;
            }
        }
        // Escape toggles English mode
        if(code === 27) {
            state.englishMode = !state.englishMode;
            e.preventDefault();
            return false;
        }
        // Reset state on navigation / delete keys
        if([8,9,13,27,32,46].includes(code) || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
            state.lastChar = '';
            resetKarModifier(state);
            state.avroChaFlag = false;
            state.avroAPressFlag = false;
        }
        return true;
    }

    function onKeyPress(e) {
        const field = e.target;
        if(!field || field.tagName !== 'TEXTAREA') return true;
        let state = editorStates.get(field);
        if(!state) {
            state = new BengaliEditorState();
            editorStates.set(field, state);
        }
        // Bypass if English mode or layout = 1 (English)
        if(state.englishMode || state.layout === 1) return true;
        const char = String.fromCharCode(e.which || e.keyCode);
        if(!char || char.length === 0) return true;
        const mapped = mapUnicodeCharacter(state.layout, char);
        if(mapped === char) return true; // not a mapped key
        ProcessCharacter(e, state, char, mapped);
        e.preventDefault();
        return false;
    }

    // ------------------------------
    // Attach to all .bengali-editor textareas
    // ------------------------------
    function attachToTextareas() {
        document.querySelectorAll('textarea.bengali-editor').forEach(ta => {
            if(ta.hasAttribute('data-bengali-handler')) return;
            ta.setAttribute('data-bengali-handler', 'true');

            let state = editorStates.get(ta);
            if(!state) {
                state = new BengaliEditorState();
                editorStates.set(ta, state);
            }
            state.layout = window.getKeyboardLayout ? window.getKeyboardLayout() : state.layout;
            updateLayoutStatus(state);

            ta.addEventListener('focus', () => {
                let focusedState = editorStates.get(ta);
                if(!focusedState) {
                    focusedState = new BengaliEditorState();
                    editorStates.set(ta, focusedState);
                }
                focusedState.layout = window.getKeyboardLayout ? window.getKeyboardLayout() : focusedState.layout;
                updateLayoutStatus(focusedState);
            });
            ta.addEventListener('keydown', onKeyDown);
            ta.addEventListener('keypress', onKeyPress);
        });
    }

    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachToTextareas);
    } else {
        attachToTextareas();
    }
})();





// function MapUnicodeCharacter(e) {
//   switch (KeyBoardLayout) {
//     case 2:
//       return bijoy_keyboard_map[e];
//     case 3:
//       return somewherein_phonetic_keyboard_map[e];
//     case 4:
//       return avro_phonetic_keyboard_map[e];
//     case 5:
//       return unijoy_keyboard_map[e];
//     default:
//       return e;
//   }
// }
// function ResetKarModifier() {
//   LC_KAR = 0;
//   LC_STRING = "";
// }
// function applyLegacyRangeReplacement(range, replacement) {
//   range.text = replacement;
//   range.collapse(true);
//   range.select();
// }
// function applyModernTextareaReplacement(field, start, end, replacement, scrollTop) {
//   field.value =
//     field.value.substring(0, start) +
//     replacement +
//     field.value.substring(end, field.value.length);
//   field.focus();
//   field.selectionStart = start + replacement.length;
//   field.selectionEnd = start + replacement.length;
//   field.scrollTop = scrollTop;
// }
// function KarModification(e, t) {
//   if (LC_KAR == LCUNI || IsBanglaHalant(LCUNI) || t == "্র" || t == "্য") {
//     var n = LC_STRING.length;
//     LC_STRING = LC_STRING + t;
//     RemoveNInsert(e, LC_STRING + LC_KAR, n + LC_KAR.length);
//   } else if (t == "র্") {
//     var n = LC_STRING.length;
//     LC_STRING = t + LC_STRING;
//     RemoveNInsert(e, LC_STRING + LC_KAR, n + LC_KAR.length);
//   } else if (IsBanglaHalant(t)) {
//     LC_STRING = LC_STRING + t;
//     Insert(e, t);
//   } else {
//     Insert(e, t);
//     ResetKarModifier();
//   }
// }
// function RefModification(e) {
//   var t = 1;
//   var n = "";
//   var r = "";
//   var i = true;
//   var s = "";
//   var backtrackStart = 0;
//   var selectionEnd = 0;
//   var scrollTop = 0;

//   e.focus();
//   while (true) {
//     if (document.selection) {
//       sel = document.selection.createRange();
//       if (e.value.length >= t) {
//         sel.moveStart("character", -1 * t);
//       } else {
//         s = "";
//         t--;
//         sel.moveStart("character", -1 * t);
//         break;
//       }
//       s = sel.text.charAt(0);
//     } else if (e.selectionStart || e.selectionStart == 0) {
//       backtrackStart = e.selectionStart - t;
//       selectionEnd = e.selectionEnd;
//       scrollTop = e.scrollTop;
//       if (backtrackStart < 0) {
//         s = "";
//         t--;
//         backtrackStart = e.selectionStart - t;
//         break;
//       }
//       s = e.value.substring(backtrackStart, backtrackStart + 1);
//     }
//     if (t != 1 && IsBanglaKar(s)) break;
//     if (t == 1 && IsBanglaKar(s)) n = s;
//     else if (IsBanglaSoroborno(s) || IsBanglaDigit(s) || IsSpace(s)) break;
//     else if (IsBanglaBanjonborno(s)) {
//       if (i == true) {
//         r = s + r;
//         i = false;
//       } else break;
//     } else if (IsBanglaHalant(s)) {
//       r = s + r;
//       i = true;
//     }
//     t++;
//   }
//   var f = s + "র্" + r + n;
//   if (document.selection) {
//     applyLegacyRangeReplacement(document.selection.createRange(), f);
//   } else if (e.selectionStart || e.selectionStart == 0) {
//     applyModernTextareaReplacement(e, backtrackStart, selectionEnd, f, scrollTop);
//   }
// }
// function OAndOuKarModification(e, t, n) {
//   if (document.selection) {
//     e.focus();
//     sel = document.selection.createRange();
//     if (e.value.length >= 1) sel.moveStart("character", -1);
//     if (sel.text.charAt(0) == "ে") sel.text = t;
//     else sel.text = sel.text.charAt(0) + n;
//     sel.collapse(true);
//     sel.select();
//   } else if (e.selectionStart || e.selectionStart == 0) {
//     var r = e.selectionStart - 1;
//     var i = e.selectionEnd;
//     var s = e.scrollTop;
//     var o;
//     r = r == -1 ? e.value.length : r;
//     if (e.value.substring(r, r + 1) == "ে") o = t;
//     else {
//       r = r + 1;
//       o = n;
//     }
//     applyModernTextareaReplacement(e, r, i, o, s);
//   }
// }
// function IsSomewhereinPhoneticModifierCharaceter(e) {
//   if (
//     e == "হ" ||
//     e == "গ" ||
//     e == "ঘ" ||
//     e == "ণ" ||
//     e == "ঃ" ||
//     e == "ট" ||
//     e == "ো" ||
//     e == "ই" ||
//     e == "ি" ||
//     e == "উ" ||
//     e == "ু" ||
//     e == "র" ||
//     e == "ড়"
//   )
//     return true;
//   return false;
// }
// function GetSomewhereinPhoneticModifiedCharaceter(e) {
//   var t = e;
//   if (LCUNI == "ক" && e == "হ") t = "খ";
//   else if (LCUNI == "গ" && e == "হ") t = "ঘ";
//   else if (LCUNI == "চ" && e == "হ") t = "চ";
//   else if (LCUNI == "জ" && e == "হ") t = "ঝ";
//   else if (LCUNI == "ট" && e == "হ") t = "ঠ";
//   else if (LCUNI == "ড" && e == "হ") t = "ঢ";
//   else if (LCUNI == "ত" && e == "হ") t = "থ";
//   else if (LCUNI == "দ" && e == "হ") t = "ধ";
//   else if (LCUNI == "প" && e == "হ") t = "ফ";
//   else if (LCUNI == "ব" && e == "হ") t = "ভ";
//   else if (LCUNI == "স" && e == "হ") t = "শ";
//   else if (LCUNI == "ড়" && e == "হ") t = "ঢ়";
//   else if (LCUNI == "ণ" && e == "গ") t = "ঙ";
//   else if (LCUNI == "ন" && e == "গ") t = "ং";
//   else if (LCUNI == "ণ" && e == "ঘ") t = "ঞ";
//   else if (LCUNI == "ণ" && e == "ণ") t = "ঁ";
//   else if (LCUNI == "ঃ" && e == "ঃ") t = "ঃ";
//   else if (LCUNI == "ট" && e == "ট") t = "ৎ";
//   else if (LCUNI == "া" && e == "ো") t = "অ";
//   else if (LCUNI == "ি" && e == "ি") t = "ী";
//   else if (LCUNI == "ই" && e == "ই") t = "ঈ";
//   else if (LCUNI == "ু" && e == "ু") t = "ূ";
//   else if (LCUNI == "উ" && e == "উ") t = "ঊ";
//   else if (LCUNI == "ও" && e == "ই") t = "ঐ";
//   else if (LCUNI == "ো" && e == "ি") t = "ৈ";
//   else if (LCUNI == "ও" && e == "উ") t = "ঔ";
//   else if (LCUNI == "ো" && e == "ু") t = "ৌ";
//   else if (LCUNI == "ৃ" && e == "র") t = "ৃ";
//   else if (LCUNI == "ঋ" && e == "ড়") t = "ঋ";
//   return t;
// }
// function IsAvroPhoneticModifierCharaceter(e) {
//   if (
//     e == "ঃ" ||
//     e == "ো" ||
//     e == "ি" ||
//     e == "ু" ||
//     IsBanglaSoroborno(e) ||
//     IsBanglaBanjonborno(e)
//   )
//     return true;
//   return false;
// }
// function GetAvroPhoneticBanjonBanjonEquivalent(e, t) {
//   var n = t;
//   if ((e == "ক" && t == "ক") || (e == "ক" && t == "খ")) n = "্" + t;
//   return n;
// }
// function GetAvroPhoneticModifiedCharaceter(e) {
//   var t = e;
//   if (e != "হ" && Avro_Cha_Flag == true) Avro_Cha_Flag = false;
//   if (LCUNI == "ক" && e == "হ") t = "খ";
//   else if (LCUNI == "গ" && e == "হ") t = "ঘ";
//   else if (LCUNI == "চ" && e == "হ" && Avro_Cha_Flag == false) {
//     t = "চ";
//     Avro_Cha_Flag = true;
//   } else if (LCUNI == "চ" && e == "হ" && Avro_Cha_Flag == true) {
//     t = "ছ";
//     Avro_Cha_Flag = false;
//   } else if (LCUNI == "জ" && e == "হ") t = "ঝ";
//   else if (LCUNI == "ট" && e == "হ") t = "ঠ";
//   else if (LCUNI == "ড" && e == "হ") t = "ঢ";
//   else if (LCUNI == "ত" && e == "হ") t = "থ";
//   else if (LCUNI == "দ" && e == "হ") t = "ধ";
//   else if (LCUNI == "প" && e == "হ") t = "ফ";
//   else if (LCUNI == "ব" && e == "হ") t = "ভ";
//   else if (LCUNI == "স" && e == "হ") t = "শ";
//   else if (LCUNI == "শ" && e == "হ") t = "ষ";
//   else if (LCUNI == "ড়" && e == "হ") t = "ঢ়";
//   else if (LCUNI == "ণ" && e == "গ") t = "ঙ";
//   else if (LCUNI == "ন" && e == "গ") t = "ং";
//   else if (LCUNI == "ণ" && e == "ঘ") t = "ঞ";
//   else if (LCUNI == "ঃ" && e == "ঃ") t = "ঃ";
//   else if (LCUNI == "ট" && e == "ট") t = "ৎ";
//   else if (LCUNI == "া" && e == "ো") t = "অ";
//   else if (LCUNI == "ি" && e == "ি") t = "ী";
//   else if (LCUNI == "ু" && e == "ু") t = "ূ";
//   else if (LCUNI == "উ" && e == "উ") t = "ঊ";
//   else if (LCUNI == "ও" && e == "ই") t = "ঐ";
//   else if (LCUNI == "ো" && e == "ি") t = "ৈ";
//   else if (LCUNI == "ও" && e == "উ") t = "ঔ";
//   else if (LCUNI == "ো" && e == "ু") t = "ৌ";
//   else if (LCUNI == "ৃ" && e == "র") t = "ৃ";
//   else if (LCUNI == "ঋ" && e == "ড়") t = "ঋ";
//   else if ((LCUNI == "র" || LCUNI == "ড়") && IsBanglaBanjonborno(e)) t = e;
//   else if (e == "ঁ") t = e;
//   else if (
//     IsBanglaBanjonborno(LCUNI) &&
//     e == "অ" &&
//     Avro_A_Press_Flag == false
//   ) {
//     Avro_A_Press_Flag = true;
//     t = LCUNI;
//   } else if (
//     IsBanglaBanjonborno(LCUNI) &&
//     IsBanglaSoroborno(e) &&
//     Avro_A_Press_Flag == true
//   ) {
//     t = e;
//   } else if (IsBanglaBanjonborno(LCUNI) && IsBanglaSoroborno(e))
//     t = MapSorbornoToKar(e);
//   else if (
//     IsBanglaBanjonborno(LCUNI) &&
//     IsBanglaBanjonborno(e) &&
//     Avro_A_Press_Flag == false
//   )
//     t = "্" + e;
//   else if (LCUNI == "অ" && e == "অ") t = "উ";
//   else if (LCUNI == "অ" && e == "ই") t = "ঐ";
//   else if (LCUNI == "অ" && e == "ই") t = "ঐ";
//   else if (LCUNI == "া" && e == "অ") t = "ও";
//   else if (LCUNI == "এ" && e == "এ") t = "ঈ";
//   else if (LCUNI == "ে" && e == "অ") t = "ও";
//   else if (LCUNI == "ও" && e == "ঈ") t = "ঔ";
//   if (e != "অ" && e != "্" && Avro_A_Press_Flag == true)
//     Avro_A_Press_Flag = false;
//   return t;
// }
// function ProcessCharacter(e, t, n, r) {
//   if (LCUNI == "‌" && r == "্য") {
//     RemoveNInsert(e, e.value.charAt(e.value.length - 1) + "‌্য", 1);
//     ResetKarModifier();
//     return;
//   }
//   if (KeyBoardLayout == 2 && LCUNI == "র" && r == "্য") {
//     RemoveNInsert(e, "ব়্য", 1);
//     ResetKarModifier();
//     return;
//   }
//   if (IsBanglaPostKar(r)) ResetKarModifier();
//   if (IsBanglaDigit(r)) ResetKarModifier();
//   if (LCUNI == "অ" && r == "া") {
//     RemoveNInsert(e, "আ", 1);
//     ResetKarModifier();
//   } else if (IsBanglaHalant(LCUNI) && IsBanglaKar(r)) {
//     RemoveNInsert(e, MapKarToSorborno(r), 1);
//     ResetKarModifier();
//   } else if (
//     KeyBoardLayout != 5 &&
//     IsBanglaNukta(LCUNI) &&
//     IsBanglaPostKar(r) == true
//   ) {
//     RemoveNInsert(e, r + LCUNI, 1);
//     ResetKarModifier();
//   } else if (KeyBoardLayout != 5 && IsBanglaNukta(LCUNI) && IsBanglaFola(r)) {
//     RemoveNInsert(e, r + LCUNI, 1);
//     ResetKarModifier();
//   } else if (KeyBoardLayout == 2 && IsBanglaPreKar(LC_KAR))
//     KarModification(e, r);
//   else if (
//     KeyBoardLayout == 3 &&
//     IsSomewhereinPhoneticModifierCharaceter(r) &&
//     IsSpace(LCUNI) == false
//   ) {
//     var i = GetSomewhereinPhoneticModifiedCharaceter(r);
//     if (i != r) {
//       r = i;
//       RemoveNInsert(e, r, 1);
//       ResetKarModifier();
//     } else Insert(e, r);
//   } else if (
//     KeyBoardLayout == 4 &&
//     IsAvroPhoneticModifierCharaceter(r) &&
//     IsSpace(LCUNI) == false
//   ) {
//     var i = GetAvroPhoneticModifiedCharaceter(r);
//     if (i != r) {
//       if (IsBanglaBanjonborno(LCUNI) && r == "হ") {
//         RemoveNInsert(e, i, 1);
//       } else if (IsBanglaBanjonborno(LCUNI) && IsBanglaBanjonborno(r)) {
//         Insert(e, i);
//       } else if (IsBanglaKar(LCUNI) && IsBanglaSoroborno(r)) {
//         Insert(e, i);
//       } else if (i == MapSorbornoToKar(r)) {
//         Insert(e, i);
//       } else {
//         RemoveNInsert(e, i, 1);
//       }
//       r = i;
//       ResetKarModifier();
//     } else Insert(e, r);
//   } else if (KeyBoardLayout != 5 && r == "র্") RefModification(e);
//   else if (KeyBoardLayout != 5 && r == "া") OAndOuKarModification(e, "ো", "া");
//   else if (KeyBoardLayout != 5 && r == "ৗ") OAndOuKarModification(e, "ৌ", "ৗ");
//   else if (n > 29) {
//     Insert(e, r);
//   } else if (n == 13 && IE) {
//     Insert(e, r);
//   }
//   if (IsBanglaHalant(LCUNI) == false && IsBanglaPreKar(r)) LC_KAR = r;
//   if (!(IsBanglaNukta(LCUNI) && IsBanglaFola(r))) {
//     LCUNI = r;
//   }
// }
// function KeyBoardDown(e) {
//   var t;
//   if (IE) t = e.srcElement;
//   else t = e.target;
//   var n = window.event ? event.keyCode : e.which;
//   var r = String.fromCharCode(n);
//   if (n == 27) EnglishKeyboard = !EnglishKeyboard;
//   if ((n >= 8 && n <= 13) || n == 27 || n == 32 || n == 46) {
//     LCUNI = 0;
//     ResetKarModifier();
//     Avro_Cha_Flag = false;
//     Avro_A_Press_Flag = false;
//   }
//   if (e.altKey && e.ctrlKey && (r == "E" || r == "e")) KeyBoardLayout = 1;
//   else if (e.altKey && e.ctrlKey && (r == "B" || r == "b"))
//     KeyBoardLayout = KeyBoardLayout == 2 ? 1 : 2;
//   else if (e.altKey && e.ctrlKey && (r == "P" || r == "p"))
//     KeyBoardLayout = KeyBoardLayout == 3 ? 1 : 3;
//   else if (e.altKey && e.ctrlKey && (r == "A" || r == "a"))
//     KeyBoardLayout = KeyBoardLayout == 4 ? 1 : 4;
//   else if (e.altKey && e.ctrlKey && (r == "U" || r == "u"))
//     KeyBoardLayout = KeyBoardLayout == 5 ? 1 : 5;
//   ChangeKeyboarLayoutStatus();
//   if (n == 27) return false;
//   return true;
// }
// function dg(e) {
//   var t;
//   if (IE) t = e.srcElement;
//   else t = e.target;
//   var n = window.event ? event.keyCode : e.which;
//   var r = String.fromCharCode(n);
//   if (e.altKey && e.ctrlKey && (r == "E" || r == "e")) return false;
//   else if (e.altKey && e.ctrlKey && (r == "B" || r == "b")) return false;
//   else if (e.altKey && e.ctrlKey && (r == "P" || r == "p")) return false;
//   else if (e.altKey && e.ctrlKey && (r == "A" || r == "a")) return false;
//   else if (e.altKey && e.ctrlKey && (r == "U" || r == "u")) return false;
//   else if (e.ctrlKey || e.altKey) return true;
//   if (KeyBoardLayout == 1 || EnglishKeyboard == true) {
//     return true;
//   }
//   var i = "";
//   i = MapUnicodeCharacter(r);
//   if (i == null) return true;
//   ProcessCharacter(t, r, n, i);
//   if (IE) event.keyCode = 0;
//   LC = r;
//   if (n > 29) return false;
//   return true;
// }
// var IE = document.all ? 1 : 0;
// var LCUNI = 0;
// var LC = 0;
// var LC_KAR = 0;
// var LC_STRING = "";
// var EnglishKeyboard = false;
// var KeyBoardLayout = 2;
// var ctl_v_conversion = false;
// var Avro_Cha_Flag = false;
// var Avro_A_Press_Flag = false;
// var bijoy_keyboard_map = {
//   0: "০",
//   1: "১",
//   2: "২",
//   3: "৩",
//   4: "৪",
//   5: "৫",
//   6: "৬",
//   7: "৭",
//   8: "৮",
//   9: "৯",
//   a: "ৃ",
//   A: "র্",
//   d: "ি",
//   D: "ী",
//   s: "ু",
//   S: "ূ",
//   f: "া",
//   F: "অ",
//   g: "্",
//   G: "।  ",
//   h: "ব",
//   H: "ভ",
//   j: "ক",
//   J: "খ",
//   k: "ত",
//   K: "থ",
//   l: "দ",
//   L: "ধ",
//   z: "্র",
//   Z: "্য",
//   x: "ো",
//   X: "ৗ",
//   c: "ে",
//   C: "ৈ",
//   v: "র",
//   V: "ল",
//   b: "ন",
//   B: "ণ",
//   n: "স",
//   N: "ষ",
//   m: "ম",
//   M: "শ",
//   q: "ঙ",
//   Q: "ং",
//   w: "য",
//   W: "য়",
//   e: "ড",
//   E: "ঢ",
//   r: "প",
//   R: "ফ",
//   t: "ট",
//   T: "ঠ",
//   y: "চ",
//   Y: "ছ",
//   u: "জ",
//   U: "ঝ",
//   i: "হ",
//   I: "ঞ",
//   o: "গ",
//   O: "ঘ",
//   p: "ড়",
//   P: "ঢ়",
//   "&": "ঁ",
//   $: "৳",
//   "`": "‌",
//   "~": "‍",
//   "\\": "ৎ",
//   "|": "ঃ",
// };
// var somewherein_phonetic_keyboard_map = {
//   0: "০",
//   1: "১",
//   2: "২",
//   3: "৩",
//   4: "৪",
//   5: "৫",
//   6: "৬",
//   7: "৭",
//   8: "৮",
//   9: "৯",
//   a: "া",
//   A: "আ",
//   d: "ড",
//   D: "দ",
//   s: "স",
//   S: "ষ",
//   f: "ফ",
//   F: "ঋ",
//   g: "গ",
//   G: "ঘ",
//   h: "হ",
//   H: "ঃ",
//   j: "জ",
//   J: "ঝ",
//   k: "ক",
//   K: "খ",
//   l: "ল",
//   L: "খ",
//   z: "য",
//   Z: "ত",
//   x: "ক্স",
//   X: "ঢ",
//   c: "চ",
//   C: "ছ",
//   v: "ভ",
//   V: "ঠ",
//   b: "ব",
//   B: "ই",
//   n: "ন",
//   N: "ণ",
//   m: "ম",
//   M: "গ",
//   q: "য়",
//   Q: "ছ",
//   w: "ৃ",
//   W: "ঋ",
//   e: "ে",
//   E: "এ",
//   r: "র",
//   R: "ড়",
//   t: "ট",
//   T: "ত",
//   y: "য়",
//   Y: "্য",
//   u: "ু",
//   U: "উ",
//   i: "ি",
//   I: "ই",
//   o: "ো",
//   O: "ও",
//   p: "প",
//   P: "চ",
//   "&": "্",
//   $: "৳",
//   "+": "্",
//   ".": "।",
//   "`": "‌",
//   "~": "‍",
//   "\\": "॥",
//   "|": "।",
// };
// var avro_phonetic_keyboard_map = {
//   0: "০",
//   1: "১",
//   2: "২",
//   3: "৩",
//   4: "৪",
//   5: "৫",
//   6: "৬",
//   7: "৭",
//   8: "৮",
//   9: "৯",
//   o: "অ",
//   a: "আ",
//   A: "আ",
//   i: "ই",
//   I: "ঈ",
//   u: "উ",
//   U: "ঊ",
//   e: "এ",
//   E: "এ",
//   O: "ও",
//   d: "দ",
//   D: "ড",
//   s: "স",
//   S: "শ",
//   f: "ফ",
//   g: "গ",
//   h: "হ",
//   H: "হ",
//   j: "জ",
//   J: "য",
//   k: "ক",
//   K: "ক",
//   l: "ল",
//   L: "ল",
//   z: "য",
//   Z: "্য",
//   c: "চ",
//   v: "ভ",
//   V: "ভ",
//   b: "ব",
//   n: "ন",
//   N: "ণ",
//   m: "ম",
//   y: "য়",
//   w: "্ব",
//   r: "র",
//   R: "ড়",
//   t: "ত",
//   T: "ট",
//   y: "য়",
//   p: "প",
//   $: "৳",
//   "+": "্",
//   ".": "।",
//   ":": "ঃ",
//   "^": "ঁ",
//   "`": "্",
// };
// var unijoy_keyboard_map = {
//   0: "০",
//   1: "১",
//   2: "২",
//   3: "৩",
//   4: "৪",
//   5: "৫",
//   6: "৬",
//   7: "৭",
//   8: "৮",
//   9: "৯",
//   a: "ৃ",
//   A: "র্",
//   d: "ি",
//   D: "ী",
//   s: "ু",
//   S: "ূ",
//   f: "া",
//   F: "অ",
//   g: "্",
//   G: "।",
//   h: "ব",
//   H: "ভ",
//   j: "ক",
//   J: "খ",
//   k: "ত",
//   K: "থ",
//   l: "দ",
//   L: "ধ",
//   z: "্র",
//   Z: "্য",
//   x: "ো",
//   X: "ৌ",
//   c: "ে",
//   C: "ৈ",
//   v: "র",
//   V: "ল",
//   b: "ন",
//   B: "ণ",
//   n: "স",
//   N: "ষ",
//   m: "ম",
//   M: "শ",
//   q: "ঙ",
//   Q: "ং",
//   w: "য",
//   W: "য়",
//   e: "ড",
//   E: "ঢ",
//   r: "প",
//   R: "ফ",
//   t: "ট",
//   T: "ঠ",
//   y: "চ",
//   Y: "ছ",
//   u: "জ",
//   U: "ঝ",
//   i: "হ",
//   I: "ঞ",
//   o: "গ",
//   O: "ঘ",
//   p: "ড়",
//   P: "ঢ়",
//   "&": "ঁ",
//   $: "৳",
//   "`": "‌",
//   "~": "‍",
//   "^": "÷",
//   "*": "×",
//   "\\": "ৎ",
//   "|": "ঃ",
// };

// function registerLegacyKeyboardHandlers() {
//   if (window.__legacyKeyboardHandlersBound === true) return;
//   var legacyTargets = [
//     'textarea#' + UNICODE_EDITOR_ID + '[name="' + UNICODE_EDITOR_NAME + '"]',
//     'textarea#EDT-mobile',
//     'textarea#CONVERTEDT',
//     'textarea#CONVERTEDT-mobile'
//   ];
//   for (var i = 0; i < legacyTargets.length; i++) {
//     var field = document.querySelector(legacyTargets[i]);
//     if (field) {
//       field.onkeydown = KeyBoardDown;
//       field.onkeypress = dg;
//     }
//   }
//   window.__legacyKeyboardHandlersBound = true;
// }

// registerLegacyKeyboardHandlers();
