var data = {
    level: 1, race: 'human', favoredClass: 'fighter', multitalentedClass: 'fighter',
    base: {'str': 10, 'dex': 10, 'con': 10, 'int': 10, 'wis': 10, 'cha': 10, 'bonus': 0},
    hitDie: [10],
    ranks: [{}],
    classLevels: ['fighter'],
    favoredClassBonus: ['hp'],
};
var cache = {};

function formatBonus(value, hideZero) {
    if (value > 0) {
        return '+' + value;
    } else if (hideZero && value == 0) {
        if (hideZero !== true) {
            return hideZero;
        }
        return '';
    }
    return '' + value;
}

function updateStats() {
    cache = {};
    cache.abilityScore = {};
    cache.pointBuyCost = {};
    cache.natAbilities = {};
    $.each(ref.abilities, function(i, ability) {
        var score = data.base[ability];
        if (i == data.base.bonus) {
            score += ref.races[data.race].statBonus;
        }
        score += ref.races[data.race][ability];
        cache.abilityScore[ability] = score;
        cache[ability] = Math.floor(0.5 * score - 5);
        cache.pointBuyCost[ability] = ref.pointBuyCosts[String(data.base[ability])];
        cache.natAbilities[ability] = cache[ability];
    });

    cache.ranks = {};
    cache.previousRanks = {};
    cache.classSkills = {};
    cache.skills = {};
    cache.totalRanks = 0;
    $.each(ref.skills, function(skill, values) {
        var ranks = 0;
        var previousRanks = 0;
        var classSkill = false;
        for (var i = 0; i < data.level; i++) {
            if (data.ranks[i][skill]) {
                ranks += data.ranks[i][skill];
            }
            if (i + 1 < data.level) {
                previousRanks = ranks;
            }
            if ($.inArray(skill, ref.classes[data.classLevels[i]].classSkills) >= 0) {
                classSkill = true;
            }
        }
        var bonus = cache[values.ability];
        bonus += ranks;
        if (ranks > 0 && classSkill) {
            bonus += 3;
        }
        cache.ranks[skill] = ranks;
        cache.previousRanks[skill] = previousRanks;
        cache.classSkills[skill] = classSkill;
        cache.skills[skill] = bonus;
        cache.totalRanks += ranks;
    });

    cache.traits = ref.races[data.race].traits;
    cache.maxRanks = 0;
    cache.maxHP = 0;
    for (var i = 0; i < data.level; i++) {
        var hp = data.hitDie[i] + cache['con'];
        cache.maxHP += (hp > 0 ? hp : 1);
        var ranks = ref.classes[data.classLevels[i]].ranks;
        ranks += cache.natAbilities[ref.classes[data.classLevels[i]].rankAbility];
        cache.maxRanks += ranks;
        if (data.favoredClass === data.classLevels[i]) {
            if (data.favoredClassBonus[i] === 'hp') {
                cache.maxHP += 1;
            } else if (data.favoredClassBonus[i] === 'skill') {
                cache.maxRanks += 1;
            }
        }
    }
    $('.update').trigger('update');
}

function TableBuilder(element) {
    this.table = element;
    this.row = null;
    this.createRow = function() {
        this.row = $(document.createElement('tr'));
        this.table.append(this.row);
        return this.row;
    }
    this.createCell = function() {
        if (this.row == null) {
            throw 'Table has no rows!';
        }
        var cell = $(document.createElement('td'));
        this.row.append(cell);
        return cell;
    }
    this.build = function() {
        return this.table;
    }
}

function SelectBuilder(element) {
    this.select = element;
    this.add = function(value, text) {
        this.select.append($(document.createElement('option')).text(text).val(value));
    }
}

function buildPage() {
    $('.selectAbility').each(function() {
        var builder = new SelectBuilder($(this));
        $.each(ref.abilities, function(i, ability) {
            builder.add(i, ref.abilityShortName[ability]);
        });
    });

    $('.selectClass').each(function() {
        var builder = new SelectBuilder($(this));
        $.each(ref.classes, function(classID, values) {
            builder.add(classID, values.name);
        });
    });

    var raceSelect = new SelectBuilder($('#selectRace'));
    $.each(ref.races, function(race, values) {
        raceSelect.add(race, values.name);
    });
    raceSelect.select.val(data.race)
        .change(function() {
            data.race = this.value;
            updateStats();
        });

    $('#selectStatBonus').val(data.base.bonus).addClass('update')
        .change(function() {
            data.base.bonus = parseInt(this.value);
            updateStats();
        })
        .on('update', function(){
            if (ref.races[data.race].statBonus == 0) {
                $('#spanStatBonus').hide();
            } else {
                $('#spanStatBonus').show();
            }
        });

    var pointBuy = new TableBuilder($('#pointBuy'));
    pointBuy.createRow();
    pointBuy.createCell();
    pointBuy.createCell().text('Points').addClass('head');
    pointBuy.createCell().text('Cost').addClass('head sep');
    pointBuy.createCell().text('Racial').addClass('head');
    pointBuy.createCell().text('Misc').addClass('head sep');
    pointBuy.createCell().text('Score').addClass('head');
    pointBuy.createCell().text('Mod').addClass('head');
    $.each(ref.abilities, function(i, ability) {
        pointBuy.createRow();
        pointBuy.createCell().text(ref.abilityShortName[ability]).addClass('head');
        var scoreInput = $(document.createElement('input')).val(data.base[ability])
            .attr('type', 'text').addClass('update input')
            .change(function() {
                data.base[ability] = parseInt(this.value);
                updateStats();
            })
            .on('update', function() {
                $(this).val(data.base[ability]);
            });
        var scoreAdd = $(document.createElement('input')).val('+')
            .attr('type', 'button').addClass('inputTiny')
            .click(function() {
                data.base[ability]++;
                updateStats();
            });
        var scoreMinus = $(document.createElement('input')).val('-')
            .attr('type', 'button').addClass('inputTiny')
            .click(function() {
                data.base[ability]--;
                updateStats();
            });
        pointBuy.createCell().addClass('field').append(scoreMinus, scoreInput, scoreAdd);
        pointBuy.createCell().addClass('update sep')
            .on('update', function(){
                var cost = cache.pointBuyCost[ability];
                $(this).text(cost != null ? cost : '?');
            });
        pointBuy.createCell().addClass('update')
            .on('update', function() {
                var value = ref.races[data.race][ability];
                if (i == data.base.bonus) {
                    value += ref.races[data.race].statBonus;
                }
                $(this).text(formatBonus(value, true));
            });
        pointBuy.createCell().addClass('update sep')
            .on('update', function() {
                var value = cache.abilityScore[ability]
                value -= data.base[ability];
                value -= ref.races[data.race][ability];
                if (i == data.base.bonus) {
                    value -= ref.races[data.race].statBonus;
                }
                $(this).text(formatBonus(value, true));
            });
        pointBuy.createCell().addClass('update')
            .on('update', function() {
                $(this).text(cache.abilityScore[ability]);
            });
        pointBuy.createCell().addClass('update')
            .on('update', function() {
                $(this).text(formatBonus(cache[ability]));
            });
    });

    $('#pointBuyTotal').addClass('update')
        .on('update', function(){
            var total = 0;
            $.each(ref.abilities, function(i, ability) {
                var cost = cache.pointBuyCost[ability];
                if (cost == null) {
                    total = "??";
                    return false;
                }
                total += cost;
            });
            $(this).val(total);
        });

    $('#selectFavoredClass').addClass('update')
        .change(function() {
            data.favoredClass = this.value;
            updateStats();
        })
        .on('update', function(){
            $(this).val(data.favoredClass);
        });

    $('#selectMultitalentedClass').addClass('update')
        .change(function() {
            data.multitalentedClass = this.value;
            updateStats();
        })
        .on('update', function(){
            $(this).val(data.multitalentedClass);
        });

    $('#spanMultitalentedClass').addClass('update')
        .on('update', function(){
            if ($.inArray('multitalented', cache.traits) >= 0) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

    $('#selectLevelClass').addClass('update')
        .change(function() {
            data.classLevels[data.level - 1] = this.value;
            updateStats();
        })
        .on('update', function(){
            $(this).val(data.classLevels[data.level - 1]);
        });

    $('#spanFavoredBonus').addClass('update')
        .on('update', function(){
            if (data.favoredClass === data.classLevels[data.level - 1]) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

    $('input[name=favoredBonus]').addClass('update')
        .change(function() {
            if ($(this).prop('checked')) {
                data.favoredClassBonus[data.level - 1] = this.value;
                updateStats();
            }
        })
        .on('update', function(){
            $(this).prop('checked', (this.value === data.favoredClassBonus[data.level - 1]));
        });

    $('#classHitDie').addClass('update')
        .on('update', function() {
            $(this).text(ref.classes[data.classLevels[data.level-1]].hitDie);
        });

    $('#hitDieValue').addClass('update')
        .on('update', function() {
            $(this).val(data.hitDie[data.level - 1]);
            if (data.level === 1) {
                $(this).prop('readonly', true);
            } else {
                $(this).prop('readonly', false);
            }
        });

    $('#hitDieRoll').addClass('update')
        .click(function() {
        })
        .on('update', function() {
            if (data.level === 1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });

    var abilities = new TableBuilder($('#abilities'));
    abilities.createRow();
    abilities.createCell();
    abilities.createCell().text('Score').addClass('head');
    abilities.createCell().text('Mod').addClass('head');
    $.each(ref.abilities, function(i, ability) {
        abilities.createRow();
        abilities.createCell().text(ref.abilityShortName[ability]).addClass('head');
        abilities.createCell().addClass('update')
            .on('update', function() {
                $(this).text(cache.abilityScore[ability]);
            });
        abilities.createCell().addClass('update')
            .on('update', function() {
                $(this).text(cache[ability]);
            });
    });

    var skills = new TableBuilder($('#skillRanks'));
    skills.createRow();
    skills.createCell().text('Skill').addClass('head');
    skills.createCell().text('Bonus').addClass('head sep');
    skills.createCell().text('Ability').addClass('head');
    skills.createCell().text('Trained').addClass('head');
    skills.createCell().text('Misc').addClass('head');
    skills.createCell().text('Ranks').addClass('head');
    $.each(ref.skills, function(skill, values) {
        skills.createRow();
        skills.createCell().text(values.name + (values.untrained ? '' : '*'))
        skills.createCell().addClass('update sep')
            .on('update', function() {
                $(this).html(formatBonus(cache.skills[skill], (values.untrained ? false : '&ndash;')));
            });
        skills.createCell().addClass('update')
            .on('update', function() {
                $(this).text(formatBonus(cache[values.ability], true));
            });
        skills.createCell().addClass('update')
            .on('update', function() {
                if (cache.classSkills[skill]) {
                    if (cache.ranks[skill] > 0) {
                        $(this).text('+3');
                    } else {
                        $(this).html('&ndash;');
                    }
                } else {
                    $(this).text('');
                }
            });
        skills.createCell().addClass('update')
            .on('update', function() {
                var bonus = cache.skills[skill] - cache.ranks[skill] - cache[values.ability];
                if (cache.ranks[skill] > 0 && cache.classSkills[skill]) {
                    bonus -= 3;
                }
                $(this).text(formatBonus(bonus, true));
            });
        var rankInput = $(document.createElement('input')).val('')
            .attr('type', 'text').addClass('update input')
            .change(function() {
                data.ranks[data.level - 1][skill] = parseInt(this.value) - cache.previousRanks[skill];
                updateStats();
            })
            .on('update', function() {
                $(this).val(cache.ranks[skill]);
            });
        var rankAdd = $(document.createElement('input')).val('+')
            .attr('type', 'button').addClass('inputTiny')
            .click(function() {
                data.ranks[data.level - 1][skill] = cache.ranks[skill] - cache.previousRanks[skill] + 1;
                updateStats();
            });
        var rankMinus = $(document.createElement('input')).val('-')
            .attr('type', 'button').addClass('inputTiny')
            .click(function() {
                data.ranks[data.level - 1][skill] = cache.ranks[skill] - cache.previousRanks[skill] - 1;
                updateStats();
            });
        skills.createCell().addClass('field').append(rankMinus, rankInput, rankAdd);
    });

    $('#maxRanks').addClass('update')
        .on('update', function() {
            $(this).val(cache.maxRanks);
        });

    $('#ranksTotal').addClass('update')
        .on('update', function() {
            $(this).val(cache.totalRanks);
        });

    var skills = new TableBuilder($('#skills'));
    skills.createRow();
    skills.createCell().text('Skill').addClass('head');
    skills.createCell().text('Bonus').addClass('head');
    $.each(ref.skills, function(skill, values) {
        skills.createRow();
        skills.createCell().text(values.name + (values.untrained ? '' : '*'))
        skills.createCell();
    });

    var traits = $('#traits');
    traits.addClass('update')
        .on('update', function() {
            traits.find('li.item').remove();
            $.each(cache.traits, function(i, trait) {
                traits.append($(document.createElement('li')).addClass('item').text(trait));
            });
        });
}

$(document).ready(function() {
    buildPage();
    updateStats();
});

