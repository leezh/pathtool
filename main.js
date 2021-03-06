var data = {
    level: 1,
    race: 'human',
    favoredClass: 'fighter',
    multitalentedClass: 'fighter',
    base: {
        'str': 10,
        'dex': 10,
        'con': 10,
        'int': 10,
        'wis': 10,
        'cha': 10,
        'bonus': 0,
        'upgrades': [0, 0, 0, 0, 0]
    },
    temp: {
        'str': 0,
        'dex': 0,
        'con': 0,
        'int': 0,
        'wis': 0,
        'cha': 0,
    },
    levels: [{hitDie: 10, ranks: {}, chosenClass: 'fighter', favoredClassBonus: 'hp'}],
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
    while (data.levels.length < data.level) {
        data.levels.push({
            hitDie: Math.floor(Math.random() * ref.classes[data.favoredClass].hitDie) + 1,
            ranks: {},
            chosenClass: data.favoredClass,
            favoredClassBonus: 'hp'
        });
    }

    cache = {
        traits: ref.races[data.race].traits,
        abilities: {},
        totalPointBuyCost: 0,
        skills: {},
        totalRanks: 0,
        maxRanks: 0,
        maxHP: 0,
    };

    $.each(ref.abilities, function(i, ability) {
        var score = data.base[ability];
        score += ref.races[data.race][ability];
        if (i === data.base.bonus) {
            score += ref.races[data.race].statBonus;
        }
        for (var l = 1; l * 4 < data.levels; l++) {
            if (i === data.upgrades[l]) {
                score++;
            }
        }
        var cost = ref.pointBuyCosts[String(data.base[ability])];
        cache.abilities[ability] = {
            natural: score,
            naturalMod: Math.floor(0.5 * score - 5),
            total: score + data.temp[ability],
            cost: cost
        };
        if (cache.abilities.totalCost !== null) {
            if (cost !== null) {
                cache.abilities.totalCost += cost;
            } else {
                cache.abilities.totalCost = null;
            }
        }
    });

    $.each(ref.abilities, function(i, ability) {
        cache[ability] = Math.floor(0.5 * cache.abilities[ability].total - 5);
    });

    $.each(ref.skills, function(skill, values) {
        var ranks = 0;
        var previousRanks = 0;
        var classSkill = false;
        for (var i = 0; i < data.level; i++) {
            if (data.levels[i].ranks[skill]) {
                ranks += data.levels[i].ranks[skill];
            }
            if (i + 1 < data.level) {
                previousRanks = ranks;
            }
            var chosenClass = data.levels[i].chosenClass;
            if ($.inArray(skill, ref.classes[chosenClass].classSkills) >= 0) {
                classSkill = true;
            }
        }
        var natural = cache[values.ability] + ranks;
        if (ranks > 0 && classSkill) {
            natural += 3;
        }
        cache.skills[skill] = {
            ranks: ranks,
            previousRanks: previousRanks,
            classSkill: classSkill,
            natural: natural,
            total: natural
        }
        cache.totalRanks += ranks;
    });

    for (var i = 0; i < data.level; i++) {
        var hp = data.levels[i].hitDie + cache['con'];
        cache.maxHP += (hp > 0 ? hp : 1);
        var chosenClass = ref.classes[data.levels[i].chosenClass];
        var ranks = chosenClass.ranks + cache.abilities[chosenClass.rankAbility].naturalMod;
        cache.maxRanks += (ranks > 0 ? ranks : 1);
        if (data.favoredClass === data.levels[i].chosenClass) {
            if (data.levels[i].favoredClassBonus === 'hp') {
                cache.maxHP += 1;
            } else if (data.levels[i].favoredClassBonus === 'skill') {
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
    $('.editPanel').each(function() {
        var panel = $(this);
        panel.wrapInner($(document.createElement('div')).addClass('wrapper'));
        var button = $(document.createElement('input'))
            .attr('type', 'button').addClass('editPanelClose').val('Close')
            .click(function() {
                panel.hide();
            });
        panel.find('.wrapper').prepend(button);
    });

    $('#infoEdit')
        .click(function() {
            $('#infoPanel').show();
        })

    $('#levelEdit')
        .click(function() {
            $('#levelPanel').show();
        })

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
    $.each(ref.abilities, function(i, ability) {
        pointBuy.createRow();
        pointBuy.createCell().text(ref.abilityShortName[ability]).addClass('head');
        var scoreInput = $(document.createElement('input')).val(data.base[ability])
            .attr('type', 'text').addClass('update input spinner')
            .change(function() {
                data.base[ability] = parseInt(this.value);
                updateStats();
            })
            .on('update', function() {
                $(this).val(data.base[ability]);
            });
        pointBuy.createCell().addClass('field').append(scoreInput);
        pointBuy.createCell().addClass('update sep')
            .on('update', function(){
                var cost = cache.abilities[ability].cost;
                $(this).text(cost != null ? cost : '?');
            });
        pointBuy.createCell().addClass('update sep')
            .on('update', function() {
                var value = ref.races[data.race][ability];
                if (i == data.base.bonus) {
                    value += ref.races[data.race].statBonus;
                }
                $(this).text(formatBonus(value, true));
            });
        pointBuy.createCell().addClass('update')
            .on('update', function() {
                $(this).text(cache.abilities[ability].natural);
            });
        pointBuy.createCell().addClass('update')
            .on('update', function() {
                $(this).text(formatBonus(cache.abilities[ability].naturalMod));
            });
    });

    $('#pointBuyTotal').addClass('update')
        .on('update', function(){
            var total = 0;
            $.each(ref.abilities, function(i, ability) {
                var cost = cache.abilities[ability].cost;
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

    $('#levelDisplay').addClass('update')
        .on('update', function(){
            $(this).text(data.level);
        });

    $('#levelSelect').addClass('update')
        .change(function() {
            var val = parseInt(this.value);
            if (val > 0 && val <= 20) {
                data.level = val;
                updateStats();
            }
        })
        .on('update', function() {
            this.max = data.levels.length;
            this.value = data.level;
        });

    $('#levelUp').addClass('update')
        .click(function() {
            if (data.level < 20) {
                data.level++;
                updateStats();
            }
        })
        .on('update', function() {
            if (data.level >= 20) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });

    $('#selectLevelClass').addClass('update')
        .change(function() {
            data.levels[data.level - 1].chosenClass = this.value;
            var hitDie = ref.classes[this.value].hitDie;
            if (data.level === 1) {
                data.levels[data.level - 1].hitDie = hitDie;
            } else {
                data.levels[data.level - 1].hitDie = Math.floor(Math.random() * hitDie) + 1;
            }
            updateStats();
        })
        .on('update', function(){
            $(this).val(data.levels[data.level - 1].chosenClass);
        });

    $('#spanFavoredBonus').addClass('update')
        .on('update', function(){
            if (data.favoredClass === data.levels[data.level - 1].chosenClass) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

    $('input[name=favoredBonus]').addClass('update')
        .change(function() {
            if ($(this).prop('checked')) {
                data.levels[data.level - 1].favoredClassBonus = this.value;
                updateStats();
            }
        })
        .on('update', function(){
            $(this).prop('checked', (this.value === data.levels[data.level - 1].favoredClassBonus));
        });

    $('#classHitDie').addClass('update')
        .on('update', function() {
            $(this).text(ref.classes[data.levels[data.level - 1].chosenClass].hitDie);
        });

    $('#hitDieValue').addClass('update')
        .on('update', function() {
            $(this).val(data.levels[data.level - 1].hitDie);
            if (data.level === 1) {
                $(this).prop('readonly', true);
            } else {
                $(this).prop('readonly', false);
            }
        });

    $('#hitDieRoll').addClass('update')
        .click(function() {
            if (data.level > 1) {
                var max = ref.classes[data.levels[data.level - 1].chosenClass].hitDie;
                data.levels[data.level - 1].hitDie = Math.floor(Math.random() * max) + 1;
                updateStats();
            }
        })
        .on('update', function() {
            if (data.level === 1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });

    var abilities = new TableBuilder($('#abilities'));
    $.each(ref.abilities, function(i, ability) {
        abilities.createRow();
        abilities.createCell().text(ref.abilityShortName[ability]).addClass('head');
        abilities.createCell().addClass('update')
            .on('update', function() {
                $(this).text(cache.abilities[ability].natural);
            });
        abilities.createCell().addClass('update')
            .on('update', function() {
                var values = cache.abilities[ability];
                $(this).text(formatBonus(values.total - values.natural - data.temp[ability], true));
            });
        var tempInput = $(document.createElement('input')).val('0')
            .attr('type', 'text').addClass('update input spinner')
            .change(function() {
                data.temp[ability] = parseInt(this.value);
                updateStats();
            })
            .on('update', function() {
                $(this).val(data.temp[ability]);
            });
        abilities.createCell().addClass('sep field').append(tempInput);
        abilities.createCell().addClass('update')
            .on('update', function() {
                $(this).text(cache.abilities[ability].total);
            });
        abilities.createCell().addClass('update')
            .on('update', function() {
                $(this).text(formatBonus(cache[ability]));
            });
    });

    var skills = new TableBuilder($('#skillRanks'));
    $.each(ref.skills, function(skill, values) {
        skills.createRow();
        skills.createCell().addClass('alignLeft').text(values.name + (values.untrained ? '' : '*'))
        skills.createCell().addClass('update sep')
            .on('update', function() {
                $(this).html(formatBonus(cache.skills[skill].total, (values.untrained ? false : '&ndash;')));
            });
        skills.createCell().addClass('update')
            .on('update', function() {
                $(this).text(formatBonus(cache[values.ability], true));
            });
        skills.createCell().addClass('update')
            .on('update', function() {
                if (cache.skills[skill].classSkill) {
                    if (cache.skills[skill].ranks > 0) {
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
                var values = cache.skills[skill];
                $(this).text(formatBonus(values.total - values.natural, true));
            });
        var rankInput = $(document.createElement('input')).val('')
            .attr('type', 'text').addClass('update input spinner')
            .change(function() {
                data.levels[data.level - 1].ranks[skill] = parseInt(this.value) - cache.skills[skill].previousRanks;
                updateStats();
            })
            .on('update', function() {
                $(this).val(cache.skills[skill].ranks);
            });
        skills.createCell().addClass('field').append(rankInput);
    });

    $('#maxRanks').addClass('update')
        .on('update', function() {
            $(this).val(cache.maxRanks);
        });

    $('#ranksTotal').addClass('update')
        .on('update', function() {
            $(this).val(cache.totalRanks);
        });

    var traits = $('#traits');
    traits.addClass('update')
        .on('update', function() {
            traits.find('li.item').remove();
            $.each(cache.traits, function(i, trait) {
                traits.append($(document.createElement('li')).addClass('item').text(trait));
            });
        });

    $('input.spinner').each(function() {
        var spinner = $(this);
        var up = $(document.createElement('input')).val('+')
            .attr('type', 'button').addClass('inputTiny')
            .click(function() {
                spinner.val(parseInt(spinner.val()) + 1);
                spinner.change();
            });
        var down = $(document.createElement('input')).val('-')
            .attr('type', 'button').addClass('inputTiny')
            .click(function() {
                spinner.val(parseInt(spinner.val()) - 1);
                spinner.change();
            });
        spinner.before(down).after(up);
    });
}

$(document).ready(function() {
    buildPage();
    updateStats();
});

