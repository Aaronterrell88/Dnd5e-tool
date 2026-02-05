// app.js

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('nav a[href^="#"]'); // Only links with #
    const diceLink = document.querySelector('#dice-link');
    const sheetTab = document.querySelector('#sheet-tab');
    const inventoryTab = document.querySelector('#inventory-tab');
    const sheetDiv = document.querySelector('#sheet');
    const inventoryDiv = document.querySelector('#inventory');

    function showSection(id) {
        sections.forEach(sec => sec.classList.add('hidden'));
        document.querySelector(id).classList.remove('hidden');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.getAttribute('href'));
        });
    });

    // Default to showing the character section
    showSection('#character');

    // Tab switching in Character
    function showTab(tabId) {
        sheetDiv.classList.add('hidden');
        inventoryDiv.classList.add('hidden');
        document.querySelector(tabId).classList.remove('hidden');
    }

    if (sheetTab) {
        sheetTab.addEventListener('click', (e) => {
            e.preventDefault();
            showTab('#sheet');
        });
    }

    if (inventoryTab) {
        inventoryTab.addEventListener('click', (e) => {
            e.preventDefault();
            showTab('#inventory');
        });
    }

    // Default to sheet tab
    showTab('#sheet');

    // Fetch and populate data on load
    async function loadData() {
        try {
            // Races
            const racesRes = await fetch('https://api.open5e.com/races/');
            const racesData = await racesRes.json();
            const raceSelect = document.querySelector('#race');
            raceSelect.innerHTML = '<option value="">Select Race</option>';
            racesData.results.forEach(race => {
                const option = document.createElement('option');
                option.value = race.slug;
                option.textContent = race.name;
                raceSelect.appendChild(option);
            });

            // Classes
            const classesRes = await fetch('https://api.open5e.com/classes/');
            const classesData = await classesRes.json();
            const classSelect = document.querySelector('#class');
            classSelect.innerHTML = '<option value="">Select Class</option>';
            classesData.results.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.slug;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });

            // Backgrounds
            const backgroundsRes = await fetch('https://api.open5e.com/backgrounds/');
            const backgroundsData = await backgroundsRes.json();
            const backgroundSelect = document.querySelector('#background');
            backgroundSelect.innerHTML = '<option value="">Select Background</option>';
            backgroundsData.results.forEach(bg => {
                const option = document.createElement('option');
                option.value = bg.slug;
                option.textContent = bg.name;
                backgroundSelect.appendChild(option);
            });

            // Items (Equipment and Magic Items)
            const equipmentRes = await fetch('https://api.open5e.com/equipment/');
            const equipmentData = await equipmentRes.json();
            const magicItemsRes = await fetch('https://api.open5e.com/magicitems/');
            const magicItemsData = await magicItemsRes.json();

            // Combine items for inventory suggestions (optional: add a dropdown for adding items)
            // For now, we'll log them; later, we can add a select in inventory to add from SRD
            console.log('Fetched Equipment:', equipmentData.results);
            console.log('Fetched Magic Items:', magicItemsData.results);

            // To integrate, add a select in inventory for adding items
            const itemSelect = document.createElement('select');
            itemSelect.id = 'add-item-select';
            itemSelect.classList = 'bg-gray-700 text-white p-2 rounded w-full mb-4';
            itemSelect.innerHTML = '<option value="">Add Item from SRD</option>';
            equipmentData.results.forEach(item => {
                const option = document.createElement('option');
                option.value = item.slug;
                option.textContent = item.name;
                itemSelect.appendChild(option);
            });
            magicItemsData.results.forEach(item => {
                const option = document.createElement('option');
                option.value = item.slug;
                option.textContent = item.name + ' (Magic)';
                itemSelect.appendChild(option);
            });

            const inventorySection = document.querySelector('#inventory');
            const addItemBtn = document.createElement('button');
            addItemBtn.textContent = 'Add Selected Item';
            addItemBtn.classList = 'bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded';
            addItemBtn.addEventListener('click', async () => {
                const selected = itemSelect.value;
                if (selected) {
                    try {
                        // Fetch item details
                        const isMagic = selected.includes('(Magic)');
                        const slug = isMagic ? selected.replace(' (Magic)', '') : selected;
                        const endpoint = isMagic ? 'magicitems' : 'equipment';
                        const res = await fetch(`https://api.open5e.com/${endpoint}/${slug}`);
                        const data = await res.json();

                        const itemDetails = `${data.name}: ${data.desc || data.description}\nDamage: ${data.damage || 'N/A'}, Bonuses: ${data.bonus || 'N/A'}`;
                        const itemList = document.querySelector('#item-list');
                        itemList.value += `\n${itemDetails}`;
                    } catch (error) {
                        console.error('Error fetching item:', error);
                    }
                }
            });

            inventorySection.insertBefore(addItemBtn, inventorySection.querySelector('.mb-6'));
            inventorySection.insertBefore(itemSelect, addItemBtn);

            // Feats
            const featsRes = await fetch('https://api.open5e.com/feats/');
            const featsData = await featsRes.json();
            const featsSelect = document.createElement('select');
            featsSelect.id = 'add-feat-select';
            featsSelect.classList = 'bg-gray-700 text-white p-2 rounded w-full mb-4';
            featsSelect.innerHTML = '<option value="">Add Feat from SRD</option>';
            featsData.results.forEach(feat => {
                const option = document.createElement('option');
                option.value = feat.slug;
                option.textContent = feat.name;
                featsSelect.appendChild(option);
            });

            const featsSection = document.createElement('div');
            featsSection.innerHTML = '<h3 class="text-lg mb-4 accent-color">Feats</h3>';
            const addFeatBtn = document.createElement('button');
            addFeatBtn.textContent = 'Add Selected Feat';
            addFeatBtn.classList = 'bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded';
            addFeatBtn.addEventListener('click', async () => {
                const selected = featsSelect.value;
                if (selected) {
                    try {
                        const res = await fetch(`https://api.open5e.com/feats/${selected}`);
                        const data = await res.json();

                        // Apply feat effects (e.g., ASI or profs)
                        const desc = data.desc.toLowerCase();
                        if (desc.includes('ability score increase')) {
                            // Prompt for choice, but for simplicity, add +1 to all (customize later)
                            Object.keys(modInputs).forEach(stat => modInputs[stat].value = (parseInt(modInputs[stat].value) || 10) + 1);
                        }
                        // Add to features
                        featuresTraits.value += `\nFeat: ${data.name}\n${data.desc}`;
                        updateCalcs();
                    } catch (error) {
                        console.error('Error fetching feat:', error);
                    }
                }
            });

            featsSection.appendChild(featsSelect);
            featsSection.appendChild(addFeatBtn);
            sheetDiv.appendChild(featsSection);

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load SRD data. Check console for details.');
        }
    }

    loadData(); // Fetch and populate on load

    // Function to calculate modifier
    function calcMod(score) {
        return Math.floor((score - 10) / 2);
    }

    // Get elements
    const levelInput = document.querySelector('#level');
    const profBonusInput = document.querySelector('#proficiency-bonus');
    const strInput = document.querySelector('#strength');
    const dexInput = document.querySelector('#dexterity');
    const conInput = document.querySelector('#constitution');
    const intInput = document.querySelector('#intelligence');
    const wisInput = document.querySelector('#wisdom');
    const chaInput = document.querySelector('#charisma');

    const strModSpan = document.querySelector('#str-mod');
    const dexModSpan = document.querySelector('#dex-mod');
    const conModSpan = document.querySelector('#con-mod');
    const intModSpan = document.querySelector('#int-mod');
    const wisModSpan = document.querySelector('#wis-mod');
    const chaModSpan = document.querySelector('#cha-mod');

    const initiativeInput = document.querySelector('#initiative');
    const passivePerceptionInput = document.querySelector('#passive-perception');
    const hitDiceInput = document.querySelector('#hit-dice');

    // Saving throws
    const strSaveProf = document.querySelector('#str-save-prof');
    const dexSaveProf = document.querySelector('#dex-save-prof');
    const conSaveProf = document.querySelector('#con-save-prof');
    const intSaveProf = document.querySelector('#int-save-prof');
    const wisSaveProf = document.querySelector('#wis-save-prof');
    const chaSaveProf = document.querySelector('#cha-save-prof');

    const strSaveInput = document.querySelector('#str-save');
    const dexSaveInput = document.querySelector('#dex-save');
    const conSaveInput = document.querySelector('#con-save');
    const intSaveInput = document.querySelector('#int-save');
    const wisSaveInput = document.querySelector('#wis-save');
    const chaSaveInput = document.querySelector('#cha-save');

    // Skills prof checkboxes and inputs
    const skills = [
        { id: 'acrobatics', prof: 'acrobatics-prof', mod: 'dex' },
        { id: 'animal-handling', prof: 'animal-handling-prof', mod: 'wis' },
        { id: 'arcana', prof: 'arcana-prof', mod: 'int' },
        { id: 'athletics', prof: 'athletics-prof', mod: 'str' },
        { id: 'deception', prof: 'deception-prof', mod: 'cha' },
        { id: 'history', prof: 'history-prof', mod: 'int' },
        { id: 'insight', prof: 'insight-prof', mod: 'wis' },
        { id: 'intimidation', prof: 'intimidation-prof', mod: 'cha' },
        { id: 'investigation', prof: 'investigation-prof', mod: 'int' },
        { id: 'medicine', prof: 'medicine-prof', mod: 'wis' },
        { id: 'nature', prof: 'nature-prof', mod: 'int' },
        { id: 'perception', prof: 'perception-prof', mod: 'wis' },
        { id: 'performance', prof: 'performance-prof', mod: 'cha' },
        { id: 'persuasion', prof: 'persuasion-prof', mod: 'cha' },
        { id: 'religion', prof: 'religion-prof', mod: 'int' },
        { id: 'sleight-of-hand', prof: 'sleight-of-hand-prof', mod: 'dex' },
        { id: 'stealth', prof: 'stealth-prof', mod: 'dex' },
        { id: 'survival', prof: 'survival-prof', mod: 'wis' }
    ];

    const modInputs = { str: strInput, dex: dexInput, con: conInput, int: intInput, wis: wisInput, cha: chaInput };
    const modSpans = { str: strModSpan, dex: dexModSpan, con: conModSpan, int: intModSpan, wis: wisModSpan, cha: chaModSpan };

    // Update function
    function updateCalcs() {
        const level = parseInt(levelInput.value) || 1;
        const profBonus = Math.floor(1 + (level / 4)) + 1; // +2 at 1, +3 at 5, etc.
        profBonusInput.value = profBonus;

        // Update modifiers
        Object.keys(modInputs).forEach(stat => {
            const score = parseInt(modInputs[stat].value) || 10;
            const mod = calcMod(score);
            modSpans[stat].textContent = mod >= 0 ? `+${mod}` : mod;
        });

        // Update initiative (Dex mod)
        initiativeInput.value = parseInt(dexModSpan.textContent) || 0;

        // Update passive perception (10 + Wis mod + prof if proficient)
        const wisMod = parseInt(wisModSpan.textContent) || 0;
        const perceptionProf = document.querySelector('#perception-prof').checked ? profBonus : 0;
        passivePerceptionInput.value = 10 + wisMod + perceptionProf;

        // Update saving throws
        const saveProfs = {
            str: strSaveProf.checked ? profBonus : 0,
            dex: dexSaveProf.checked ? profBonus : 0,
            con: conSaveProf.checked ? profBonus : 0,
            int: intSaveProf.checked ? profBonus : 0,
            wis: wisSaveProf.checked ? profBonus : 0,
            cha: chaSaveProf.checked ? profBonus : 0
        };
        strSaveInput.value = (parseInt(strModSpan.textContent) || 0) + saveProfs.str;
        dexSaveInput.value = (parseInt(dexModSpan.textContent) || 0) + saveProfs.dex;
        conSaveInput.value = (parseInt(conModSpan.textContent) || 0) + saveProfs.con;
        intSaveInput.value = (parseInt(intModSpan.textContent) || 0) + saveProfs.int;
        wisSaveInput.value = (parseInt(wisModSpan.textContent) || 0) + saveProfs.wis;
        chaSaveInput.value = (parseInt(chaModSpan.textContent) || 0) + saveProfs.cha;

        // Update skills
        skills.forEach(skill => {
            const skillInput = document.querySelector(`#${skill.id}`);
            const skillProf = document.querySelector(`#${skill.prof}`).checked ? profBonus : 0;
            const mod = parseInt(document.querySelector(`#${skill.mod}-mod`).textContent) || 0;
            skillInput.value = mod + skillProf;
        });
    }

    // Listeners for changes
    [levelInput, profBonusInput, strInput, dexInput, conInput, intInput, wisInput, chaInput, ...document.querySelectorAll('input[type="checkbox"][id$="-prof"]')].forEach(el => {
        el.addEventListener('input', updateCalcs);
        el.addEventListener('change', updateCalcs);
    });

    // Initial update
    updateCalcs();

    // Auto-apply from selections
    const raceSelect = document.querySelector('#race');
    const classSelect = document.querySelector('#class');
    const backgroundSelect = document.querySelector('#background');
    const itemList = document.querySelector('#item-list');
    const featuresTraits = document.querySelector('#features-traits');
    const otherProficiencies = document.querySelector('#other-proficiencies');

    // Map skill slugs to checkbox IDs
    const skillMap = {
        'acrobatics': 'acrobatics-prof',
        'animal-handling': 'animal-handling-prof',
        'arcana': 'arcana-prof',
        'athletics': 'athletics-prof',
        'deception': 'deception-prof',
        'history': 'history-prof',
        'insight': 'insight-prof',
        'intimidation': 'intimidation-prof',
        'investigation': 'investigation-prof',
        'medicine': 'medicine-prof',
        'nature': 'nature-prof',
        'perception': 'perception-prof',
        'performance': 'performance-prof',
        'persuasion': 'persuasion-prof',
        'religion': 'religion-prof',
        'sleight-of-hand': 'sleight-of-hand-prof',
        'stealth': 'stealth-prof',
        'survival': 'survival-prof'
    };

    // Map save slugs to checkbox IDs
    const saveMap = {
        'strength': 'str-save-prof',
        'dexterity': 'dex-save-prof',
        'constitution': 'con-save-prof',
        'intelligence': 'int-save-prof',
        'wisdom': 'wis-save-prof',
        'charisma': 'cha-save-prof'
    };

    // Reset proficiencies
    function resetProfs() {
        // Uncheck all save profs
        Object.values(saveMap).forEach(id => {
            const checkbox = document.querySelector(`#${id}`);
            if (checkbox) checkbox.checked = false;
        });
        // Uncheck all skill profs
        Object.values(skillMap).forEach(id => {
            const checkbox = document.querySelector(`#${id}`);
            if (checkbox) checkbox.checked = false;
        });
        // Reset other fields if needed
        hitDiceInput.value = '';
        otherProficiencies.value = '';
        featuresTraits.value = '';
        document.querySelector('#speed').value = 30; // Default
        itemList.value = ''; // Clear inventory for new selections
    }

    // Apply race
    raceSelect.addEventListener('change', async () => {
        resetProfs(); // Reset before applying new
        const slug = raceSelect.value;
        if (!slug) return;

        try {
            const res = await fetch(`https://api.open5e.com/races/${slug}`);
            const data = await res.json();

            // Apply ASI
            data.asi.forEach(asi => {
                const stat = asi.attribute.toLowerCase().slice(0,3);
                const input = modInputs[stat];
                if (input) {
                    input.value = (parseInt(input.value) || 10) + asi.value;
                }
            });

            // Speed
            document.querySelector('#speed').value = data.speed || 30;

            // Languages and traits
            let traitsText = data.desc + '\n' + data.traits; // Combined desc and traits
            featuresTraits.value += `\nRace Traits: ${traitsText}`;
            otherProficiencies.value += data.languages ? `\nLanguages: ${data.languages}` : '';

            updateCalcs();
        } catch (error) {
            console.error('Error fetching race:', error);
        }
    });

    // Apply class and level
    async function updateClassAndLevel() {
        resetProfs(); // Reset before applying new
        const slug = classSelect.value;
        const level = parseInt(levelInput.value) || 1;
        if (!slug) return;

        try {
            const classRes = await fetch(`https://api.open5e.com/classes/${slug}`);
            const classData = await classRes.json();

            // Saving throw profs (from class)
            classData.prof_saving_throws.split(', ').forEach(save => {
                const stat = save.toLowerCase();
                const profCheckbox = document.querySelector(`#${saveMap[stat]}`);
                if (profCheckbox) profCheckbox.checked = true;
            });

            // Hit dice
            hitDiceInput.value = `${level}d${classData.hd}`;

            // Fetch level-specific features
            let featuresText = '';
            for (let l = 1; l <= level; l++) {
                const levelRes = await fetch(`https://api.open5e.com/classes/${slug}/levels/${l}/`);
                const levelData = await levelRes.json();
                featuresText += `\nLevel ${l} Features: ${levelData.features.map(f => f.name).join(', ')}`;
            }
            featuresTraits.value += `\nClass Features: ${classData.desc} ${featuresText}`;

            // Proficiencies
            otherProficiencies.value += `\nClass Proficiencies: ${classData.prof_skills_desc}`;

            // Equipment
            itemList.value += `\nClass Equipment: ${classData.equipment}`;

            updateCalcs();
        } catch (error) {
            console.error('Error fetching class/level:', error);
        }
    }

    classSelect.addEventListener('change', updateClassAndLevel);
    levelInput.addEventListener('change', updateClassAndLevel);

    // Apply background
    backgroundSelect.addEventListener('change', async () => {
        const slug = backgroundSelect.value;
        if (!slug) return;

        try {
            const res = await fetch(`https://api.open5e.com/backgrounds/${slug}`);
            const data = await res.json();

            // Skill profs
            if (data.skill_proficiencies) {
                data.skill_proficiencies.split(', ').forEach(skill => {
                    const skillSlug = skill.toLowerCase().replace(' ', '-');
                    const profCheckbox = document.querySelector(`#${skillMap[skillSlug]}`);
                    if (profCheckbox) profCheckbox.checked = true;
                });
            }

            // Features and equipment
            featuresTraits.value += `\nBackground Feature: ${data.feature}\n${data.feature_desc}`;
            itemList.value += `\nBackground Equipment: ${data.equipment}`;

            // Tools/languages
            otherProficiencies.value += data.tool_proficiencies ? `\nTool Proficiencies: ${data.tool_proficiencies}` : '';

            updateCalcs();
        } catch (error) {
            console.error('Error fetching background:', error);
        }
    });

    // Roll Stats
    function rollStats() {
        const statSums = [];
        for (let i = 0; i < 7; i++) {
            let rolls = [];
            for (let j = 0; j < 4; j++) {
                let roll = Math.floor(Math.random() * 6) + 1;
                if (roll === 1) {
                    roll = Math.floor(Math.random() * 6) + 1; // Reroll if 1
                }
                rolls.push(roll);
            }
            rolls.sort((a, b) => a - b);
            const statSum = rolls.slice(1).reduce((a, b) => a + b, 0);
            statSums.push(statSum);
        }
        statSums.sort((a, b) => b - a);
        return statSums.slice(0, 6);
    }

    const rollStatsBtn = document.querySelector('#roll-stats');
    if (rollStatsBtn) {
        rollStatsBtn.addEventListener('click', () => {
            const stats = rollStats();
            strInput.value = stats[0];
            dexInput.value = stats[1];
            conInput.value = stats[2];
            intInput.value = stats[3];
            wisInput.value = stats[4];
            chaInput.value = stats[5];
            updateCalcs();
            alert(`Rolled stats: ${stats.join(', ')}`);
        });
    }

    // Save Character (placeholder: console log)
    const form = document.querySelector('#sheet form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Character sheet saved:', new FormData(form));
            alert('Character sheet saved! (Logged to console)');
        });
    }

    // Save Inventory (placeholder)
    const saveInventoryBtn = document.querySelector('#save-inventory');
    if (saveInventoryBtn) {
        saveInventoryBtn.addEventListener('click', () => {
            // Gather all equipped inputs and item list
            const inventoryData = {
                items: document.querySelector('#item-list').value,
                weapon1: document.querySelector('#weapon-1').value,
                // ... gather others
            };
            console.log('Inventory saved:', inventoryData);
            alert('Inventory saved! (Logged to console)');
        });
    }

    // Auto-pull placeholder: Listen for changes in equipped weapons and update attacks
    // For now, simple copy on change (expand later with real item data)
    const weapon1 = document.querySelector('#weapon-1');
    const weapon2 = document.querySelector('#weapon-2');
    const bow = document.querySelector('#bow');
    if (weapon1 && weapon2) {
        weapon1.addEventListener('change', updateAttacks);
        weapon2.addEventListener('change', updateAttacks);
        bow.addEventListener('change', updateRanged);
    }

    function updateAttacks() {
        const meleeText = [];
        if (weapon1.value) meleeText.push(weapon1.value);
        if (weapon2.value) meleeText.push(` (Off-hand: ${weapon2.value})`);
        document.querySelector('#melee-attack').value = meleeText.join('');
    }

    function updateRanged() {
        document.querySelector('#ranged-attack').value = bow.value || '';
    }

    // Dice Roller Pop-up
    if (diceLink) {
        diceLink.addEventListener('click', (e) => {
            e.preventDefault();
            openDiceRollerPopup();
        });
    }

    function openDiceRollerPopup() {
        const popupWidth = 500;
        const popupHeight = 400;
        const popup = window.open('', 'DiceRoller', `width=${popupWidth},height=${popupHeight},resizable=yes,scrollbars=no`);

        popup.document.write(`
            <!DOCTYPE html>
            <html lang="en" class="dark">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dice Roller</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-900 text-white p-6">
                <h2 class="text-xl mb-4">Advanced Dice Roller</h2>
                <div class="space-y-4">
                    <div>
                        <label for="dice-expression" class="block mb-2">Dice Expression (e.g., 2d6 + 1d8 + 4):</label>
                        <input id="dice-expression" type="text" value="1d20" class="bg-gray-700 text-white p-2 rounded w-full">
                    </div>
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center">
                            <input type="radio" name="adv" value="normal" checked class="mr-2"> Normal
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="adv" value="advantage" class="mr-2"> Advantage (d20 only)
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="adv" value="disadvantage" class="mr-2"> Disadvantage (d20 only)
                        </label>
                    </div>
                    <div class="space-x-4">
                        <button id="roll-btn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Roll</button>
                        <button id="stat-roll-btn" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Roll Stats</button>
                    </div>
                    <div id="result" class="text-lg mt-4"></div>
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        function rollDice(sides) {
                            return Math.floor(Math.random() * sides) + 1;
                        }

                        function parseAndRoll(expression, advType = 'normal') {
                            expression = expression.replace(/\\s/g, ''); // Fixed to remove spaces
                            const terms = expression.split('+');
                            let total = 0;
                            let details = [];
                            
                            terms.forEach(term => {
                                if (term.includes('d')) {
                                    const [count, sides] = term.split('d').map(Number);
                                    const diceCount = count || 1;
                                    if (sides === 20 && (advType === 'advantage' || advType === 'disadvantage')) {
                                        const rolls = [rollDice(20), rollDice(20)];
                                        const result = advType === 'advantage' ? Math.max(...rolls) : Math.min(...rolls);
                                        total += result;
                                        details.push(\`\${term} (\${rolls.join(', ')}) -> \${result}\`);
                                    } else {
                                        let subTotal = 0;
                                        let subRolls = [];
                                        for (let i = 0; i < diceCount; i++) {
                                            const roll = rollDice(sides);
                                            subRolls.push(roll);
                                            subTotal += roll;
                                        }
                                        total += subTotal;
                                        details.push(\`\${term} (\${subRolls.join(', ')}) = \${subTotal}\`);
                                    }
                                } else {
                                    const modifier = parseInt(term) || 0;
                                    total += modifier;
                                    if (modifier !== 0) details.push(\`\${term}\`);
                                }
                            });
                            
                            return { total, details };
                        }

                        const rollButton = document.querySelector('#roll-btn');
                        if (rollButton) {
                            rollButton.addEventListener('click', () => {
                                const expression = document.querySelector('#dice-expression').value;
                                const advType = document.querySelector('input[name="adv"]:checked').value;
                                const { total, details } = parseAndRoll(expression, advType);
                                document.querySelector('#result').innerHTML = \`Total: \${total}<br>Details: \${details.join(' + ')}\`;
                            });
                        }

                        const statRollButton = document.querySelector('#stat-roll-btn');
                        if (statRollButton) {
                            statRollButton.addEventListener('click', () => {
                                const statSums = [];
                                for (let i = 0; i < 7; i++) {
                                    let rolls = [];
                                    for (let j = 0; j < 4; j++) {
                                        let roll = rollDice(6);
                                        if (roll === 1) {
                                            roll = rollDice(6);
                                        }
                                        rolls.push(roll);
                                    }
                                    rolls.sort((a, b) => a - b);
                                    const statSum = rolls.slice(1).reduce((a, b) => a + b, 0);
                                    statSums.push(statSum);
                                }
                                statSums.sort((a, b) => b - a);
                                const topSix = statSums.slice(0, 6);
                                document.querySelector('#result').innerHTML = \`Stat Rolls (top 6): \${topSix.join(', ')}<br>All 7: \${statSums.join(', ')}\`;
                            });
                        }
                    });
                </script>
            </body>
            </html>
        `);

        popup.document.close();
    }
});