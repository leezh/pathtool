var ref = {};
ref.abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
ref.races = {};
ref.skills = {};
ref.classes = {};

addData = function(dir, name, data, overwrite) {
    if (overwrite || dir[name] === null || typeof(dir[name]) !== 'object') {
        dir[name] = data;
    } else if ($.isArray(data)) {
        if ($.isArray(dir[name])) {
            dir[name] = dir[name].concat(data);
        } else {
            throw 'mismatched type';
        }
    } else {
        $.each(data, function(key, val) {
            addData(dir[name], key, val);
        });
    }
};

addData(ref, 'abilityShortName', {
    'str': 'Str',
    'dex': 'Dex',
    'con': 'Con',
    'int': 'Int',
    'wis': 'Wis',
    'cha': 'Cha'
});

addData(ref, 'abilityLongName', {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma'
});

addData(ref, 'pointBuyCosts', {
    '7': -4,
    '8': -2,
    '9': -1,
    '10': 0,
    '11': 1,
    '12': 2,
    '13': 3,
    '14': 5,
    '15': 7,
    '16': 10,
    '17': 13,
    '18': 17
});

