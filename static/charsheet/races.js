addData(ref.races, 'dwarf', {
    'name': 'Dwarf',
    'str': 0,
    'dex': 0,
    'con': 2,
    'int': 0,
    'wis': 2,
    'cha': -2,
    'statBonus': 0,
    'traits': [
        'mediumSize',
        'slowAndSteady',
        'darkvision',
        'defensiveTraining_giant',
        'hatred_orc',
        'hatred_goblin',
        'hardy',
        'stability',
        'weaponFamiliarity_dwarven'
    ],
    'languageStart': ['common', 'dwarven'],
    'languageBonus': ['giant', 'gnome', 'goblin', 'orc', 'terran', 'undercommon']
});

addData(ref.races, 'elf', {
    'name': 'Elf',
    'str': 0,
    'dex': 2,
    'con': -2,
    'int': 2,
    'wis': 0,
    'cha': 0,
    'statBonus': 0,
    'traits': [
        'mediumSize',
        'normalSpeed',
        'lowLightVision',
        'elvenImmunities',
        'elvenMagic',
        'keenSenses',
        'weaponFamiliarity_elven'
    ],
    'languageStart': ['common', 'elven'],
    'languageBonus': ['celestial', 'draconic', 'gnoll', 'gnome', 'goblin', 'orc', 'sylvan']
});

addData(ref.races, 'gnome', {
    'name': 'Gnome',
    'str': -2,
    'dex': 0,
    'con': 2,
    'int': 0,
    'wis': 0,
    'cha': 2,
    'statBonus': 0,
    'traits': [
        'smallSize',
        'slowSpeed',
        'lowLightVision',
        'defensiveTraining_giant',
        'gnomeMagic',
        'hatred_reptile',
        'hatred_goblin',
        'illusionResistance',
        'keenSenses',
        'obsessive',
        'weaponFamiliarity_gnome'
    ],
    'languageStart': ['common', 'gnome', 'sylvan'],
    'languageBonus': ['draconic','elven', 'giant', 'goblin', 'orc']
});

addData(ref.races, 'halfElf', {
    'name': 'Half-Elf',
    'str': 0,
    'dex': 0,
    'con': 0,
    'int': 0,
    'wis': 0,
    'cha': 0,
    'statBonus': 2,
    'traits': [
        'mediumSize',
        'normalSpeed',
        'lowLightVision',
        'adaptability',
        'elvenImmunities',
        'keenSenses',
        'multitalented'
    ],
    'languageStart': ['common', 'elven'],
    'languageBonus': ['any']
});

addData(ref.races, 'halfOrc', {
    'name': 'Half-Orc',
    'str': 0,
    'dex': 0,
    'con': 0,
    'int': 0,
    'wis': 0,
    'cha': 0,
    'statBonus': 2,
    'traits': [
        'mediumSize',
        'normalSpeed',
        'darkvision',
        'intimidating',
        'orcFerocity',
        'weaponFamiliarity_orc'
    ],
    'languageStart': ['common', 'orc'],
    'languageBonus': ['abyssal', 'draconic', 'giant', 'gnoll', 'goblin']
});

addData(ref.races, 'halfling', {
    'name': 'Halfling',
    'str': -2,
    'dex': 2,
    'con': 0,
    'int': 0,
    'wis': 0,
    'cha': 2,
    'statBonus': 0,
    'traits': [
        'smallSize',
        'slowSpeed',
        'fearless',
        'halflingLuck',
        'keenSenses',
        'sureFooted',
        'weaponFamiliarity_halfling'
    ],
    'languageStart': ['common', 'halfling'],
    'languageBonus': ['dwarven', 'elven', 'gnome', 'goblin']
});

addData(ref.races, 'human', {
    'name': 'Human',
    'str': 0,
    'dex': 0,
    'con': 0,
    'int': 0,
    'wis': 0,
    'cha': 0,
    'statBonus': 2,
    'traits': [
        'mediumSize',
        'normalSpeed',
        'bonusFeatHuman',
        'skilled'
    ],
    'languageStart': ['common'],
    'languageBonus': ['any']
});

