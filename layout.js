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
        return /[\u0995-\u09B9]/.test(ch); // ক খ গ ঘ ঙ চ ছ জ ঝ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ
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
    // Layout Maps
    // ------------------------------
    const unijoy_keyboard_map = {
        0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",
        a:"ৃ",A:"র্",d:"ি",D:"ী",s:"ু",S:"ূ",f:"া",F:"অ",g:"্",G:"।",
        h:"ব",H:"ভ",j:"ক",J:"খ",k:"ত",K:"থ",l:"দ",L:"ধ",z:"্র",Z:"্য",
        x:"ো",X:"ৌ",c:"ে",C:"ৈ",v:"র",V:"ল",b:"ন",B:"ণ",n:"স",N:"ষ",
        m:"ম",M:"শ",q:"ঙ",Q:"ং",w:"য",W:"য়",e:"ড",E:"ঢ",r:"প",R:"ফ",
        t:"ট",T:"ঠ",y:"চ",Y:"ছ",u:"জ",U:"ঝ",i:"হ",I:"ঞ",o:"গ",O:"ঘ",
        p:"ড়",P:"ঢ়","&":"ঁ","$":"৳","`":"‌","~":"‍","^":"÷","*":"×","\\":"ৎ","|":"ঃ"
    };
    
    const bangla_phonetic_keyboard_map = {
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

    const bijoy_keyboard_map = {
        0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",
        a:"ৃ",A:"র্",d:"ি",D:"ী",s:"ু",S:"ূ",f:"া",F:"অ",g:"্",G:"।  ",
        h:"ব",H:"ভ",j:"ক",J:"খ",k:"ত",K:"থ",l:"দ",L:"ধ",z:"্র",Z:"্য",
        x:"ো",X:"ৗ",c:"ে",C:"ৈ",v:"র",V:"ল",b:"ন",B:"ণ",n:"স",N:"ষ",
        m:"ম",M:"শ",q:"ঙ",Q:"ং",w:"য",W:"য়",e:"ড",E:"ঢ",r:"প",R:"ফ",
        t:"ট",T:"ঠ",y:"চ",Y:"ছ",u:"জ",U:"ঝ",i:"হ",I:"ঞ",o:"গ",O:"ঘ",
        p:"ড়",P:"ঢ়","&":"ঁ","$":"৳","`":"‌","~":"‍","\\":"ৎ","|":"ঃ"
    };
    function mapUnicodeCharacter(layout, latinChar) {
        let map;
        switch(layout) {
            case 2: map = unijoy_keyboard_map; break;
            case 3: map = bangla_phonetic_keyboard_map; break;
            case 4: map = avro_phonetic_keyboard_map; break;
            case 5: map = bijoy_keyboard_map; break;
            default: return latinChar;
        }
        return map[latinChar] !== undefined ? map[latinChar] : latinChar;
    }

    // ------------------------------
    // Layout switching UI helper
    // ------------------------------
    function syncLayoutSelect(layoutValue) {
        const select = document.getElementById('keyboard-layout');
        if (select) select.value = String(layoutValue);
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
    // Core composition functions (unchanged logic)
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
            if(backtrackStart < 0) break;
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
            if(backtrack > 20) break;
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
            'কক':'্ক','কখ':'্ক্খ'
        };
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
        // if(IsBanglaBanjonborno(prev) && IsBanglaBanjonborno(ch) && !state.avroAPressFlag)
        //     return '্' + ch;
        const key = prev + ch;
        if(pairs[key]) return pairs[key];
        if(ch !== 'অ' && ch !== '্') state.avroAPressFlag = false;
        return ch;
    }

    // Core processor – used by both keypress and input handlers
    function ProcessCharacterWithState(field, state, latinChar, mappedChar) {
        const prev = state.lastChar;
        // Special rule for ZWNJ + য-ফলা
        if(prev === '‌' && mappedChar === '্য') {
            RemoveNInsert(field, field.value.slice(-1) + '‌্য', 1);
            resetKarModifier(state);
            return;
        }
       if((state.layout === 2 || state.layout === 5) && prev === 'র' && mappedChar === '্য') {
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
            KarModification({target: field}, state, mappedChar);
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
            RefModification({target: field}, state);
        else if(state.layout !== 5 && mappedChar === 'া')
            OAndOuKarModification({target: field}, state, 'া');
        else if(state.layout !== 5 && mappedChar === 'ৗ')
            OAndOuKarModification({target: field}, state, 'ৗ');
        else
            Insert(field, mappedChar);

        if(!IsBanglaHalant(prev) && IsBanglaPreKar(mappedChar)) state.lastKar = mappedChar;
        if(!(IsBanglaNukta(prev) && IsBanglaFola(mappedChar))) state.lastChar = mappedChar;
    }

    // ------------------------------
    // Keyboard event handlers (desktop)
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
        // Layout switching shortcuts
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
        // Reset state on navigation/delete keys
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
        if(state.englishMode || state.layout === 1) return true;
        const char = String.fromCharCode(e.which || e.keyCode);
        if(!char || char.length === 0) return true;
        const mapped = mapUnicodeCharacter(state.layout, char);
        if(mapped === char) return true;
        ProcessCharacterWithState(field, state, char, mapped);
        e.preventDefault();
        return false;
    }

    // ------------------------------
    // Mobile/tablet support: input event handler
    // ------------------------------
    function onInput(e) {
        const field = e.target;
        if(!field || field.tagName !== 'TEXTAREA') return;
        let state = editorStates.get(field);
        if(!state) {
            state = new BengaliEditorState();
            editorStates.set(field, state);
        }
        // Skip if English mode or layout = 1 (English)
        if(state.englishMode || state.layout === 1) return;

        // Get the old value and selection before change
        const oldValue = field.oldValue !== undefined ? field.oldValue : field.value;
        const oldStart = field.selectionStart;
        
        // We'll process after the input event completes to compare
        setTimeout(() => {
            const newValue = field.value;
            const newStart = field.selectionStart;
            
            // Find the first differing position
            let diffPos = -1;
            for (let i = 0; i < Math.min(oldValue.length, newValue.length); i++) {
                if (oldValue[i] !== newValue[i]) {
                    diffPos = i;
                    break;
                }
            }
            if (diffPos === -1 && oldValue.length !== newValue.length) {
                diffPos = Math.min(oldValue.length, newValue.length);
            }
            if (diffPos === -1) {
                field.oldValue = newValue;
                return;
            }
            
            // Determine inserted text (if any)
            let inserted = '';
            if (newValue.length > oldValue.length) {
                inserted = newValue.slice(diffPos, diffPos + (newValue.length - oldValue.length));
            } else {
                // Deletion – reset state
                state.lastChar = '';
                resetKarModifier(state);
                state.avroChaFlag = false;
                state.avroAPressFlag = false;
                field.oldValue = newValue;
                return;
            }
            
            // If a single Latin character (or mapped) was inserted
            if (inserted.length === 1) {
                const ch = inserted[0];
                const mapped = mapUnicodeCharacter(state.layout, ch);
                if (mapped !== ch) {
                    // Replace the inserted character with mapped Bengali
                    const before = newValue.slice(0, diffPos);
                    const after = newValue.slice(diffPos + 1);
                    const newText = before + mapped + after;
                    field.value = newText;
                    const newCaretPos = diffPos + mapped.length;
                    field.selectionStart = field.selectionEnd = newCaretPos;
                    
                    // Update state using the same logic as ProcessCharacterWithState
                    // We need to simulate the previous character (state.lastChar) correctly.
                    // The previous char before insertion is oldValue[diffPos-1] or ''.
                    const simulatedPrev = (diffPos > 0 && diffPos <= oldValue.length) ? oldValue[diffPos-1] : '';
                    // Temporarily set lastChar for the processor (it will use field.value already updated)
                    // But ProcessCharacterWithState expects the field's current value and will modify it further.
                    // However we already replaced the character, so we just need to update the internal state flags.
                    // To keep it simple, we manually apply the state changes that ProcessCharacterWithState would do.
                    const prevChar = state.lastChar;
                    state.lastChar = simulatedPrev;
                    // Call the processor again? No, because we already replaced. Instead we replicate minimal state updates.
                    // But for phonetic rules (Avro/Somewherein) that depend on previous char, we should re-evaluate.
                    // Safest: call ProcessCharacterWithState on the original insertion position with the mapped char,
                    // but that would double-insert. So we'll directly mimic the main state transitions.
                    
                    // Special handling for Avro's 'অ' + 'া' -> 'আ' etc.
                    if (prevChar === 'অ' && mapped === 'া') {
                        // Already handled by our replacement? Actually we replaced 'া' directly, but 'অ' remains.
                        // So we need to merge them: remove 'অ' and the inserted 'া', replace with 'আ'.
                        if (diffPos > 0 && newText[diffPos-1] === 'অ') {
                            const fixed = newText.slice(0, diffPos-1) + 'আ' + newText.slice(diffPos + mapped.length);
                            field.value = fixed;
                            field.selectionStart = field.selectionEnd = diffPos - 1 + 'আ'.length;
                        }
                    }
                    
                    // Update lastChar based on mapped character (excluding halant etc.)
                    if (!IsBanglaHalant(prevChar) && IsBanglaPreKar(mapped)) state.lastKar = mapped;
                    if (!(IsBanglaNukta(prevChar) && IsBanglaFola(mapped))) state.lastChar = mapped;
                    
                    // Reset modifiers if needed
                    if (IsBanglaPostKar(mapped) || IsBanglaDigit(mapped)) resetKarModifier(state);
                    
                    field.oldValue = field.value;
                    return;
                }
            }
            // For multi-character insertions (e.g., paste), fall back to resetting state
            state.lastChar = '';
            resetKarModifier(state);
            state.avroChaFlag = false;
            state.avroAPressFlag = false;
            field.oldValue = newValue;
        }, 0);
        
        // Store current value for next comparison
        field.oldValue = field.value;
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
            
            // Initialize oldValue for input handler
            ta.oldValue = ta.value;
            
            ta.addEventListener('focus', () => {
                let focusedState = editorStates.get(ta);
                if(!focusedState) {
                    focusedState = new BengaliEditorState();
                    editorStates.set(ta, focusedState);
                }
                focusedState.layout = window.getKeyboardLayout ? window.getKeyboardLayout() : focusedState.layout;
                updateLayoutStatus(focusedState);
                ta.oldValue = ta.value;
            });
            ta.addEventListener('keydown', onKeyDown);
            ta.addEventListener('keypress', onKeyPress);
            ta.addEventListener('input', onInput);
        });
    }

    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachToTextareas);
    } else {
        attachToTextareas();
    }
})();

