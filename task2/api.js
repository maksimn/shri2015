/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
            {name: 'Cameroon', continent: 'Africa'},
            {name :'Fiji Islands', continent: 'Oceania'},
            {name: 'Guatemala', continent: 'North America'},
            {name: 'Japan', continent: 'Asia'},
            {name: 'Yugoslavia', continent: 'Europe'},
            {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
            {name: 'Bamenda', country: 'Cameroon'},
            {name: 'Suva', country: 'Fiji Islands'},
            {name: 'Quetzaltenango', country: 'Guatemala'},
            {name: 'Osaka', country: 'Japan'},
            {name: 'Subotica', country: 'Yugoslavia'},
            {name: 'Zanzibar', country: 'Tanzania'},
        ],
        '/populations': [
            {count: 138000, name: 'Bamenda'},
            {count: 77366, name: 'Suva'},
            {count: 90801, name: 'Quetzaltenango'},
            {count: 2595674, name: 'Osaka'},
            {count: 100386, name: 'Subotica'},
            {count: 157634, name: 'Zanzibar'}
        ]
    };
 
    setTimeout(function () {
        var result = RESPONSES[url];
        if (!result) {
            return callback('Unknown url');
        }
 
        callback(null, result);
    }, Math.round(Math.random * 1000));
}
 
/**
 * Ваши изменения ниже
 */
var requests = ['/countries', '/cities', '/populations'];
var responses = {};

// Ошибка в первоначальном коде имеет следующее происхождение. В API функции getData() происходит
// обратный вызов, выполняемый через вызов функции setTimeout(), так что исполнение кода становится 
// асинхронным.
// При этом код функции обратного вызова привязан к определенным вне него переменным (request, i, 
// requests, responses), а в случае асинхронного выполнения кода это означает, что мы не можем 
// полагаться на то, что эти переменные будут последовательно иметь значения, которые следовало бы
// ожидать в случае синхронного выполнения кода.
// Исправление ошибки может быть в том, чтобы переструктурировать код -- ввести значения  
// этих переменных или нужную логику внутрь логики вызова функции (обратного вызова).
for (i = 0; i < 3; i++) {
    g(i);
}
function g(i) {
    var request = requests[i];
    var callback = function (error, result) {
        responses[request] = result;
        var l = [];
        for (K in responses)
            l.push(K);

        if (l.length == 3) {
            var c = [], cc = [], p = 0;
            for (i = 0; i < responses['/countries'].length; i++) {
                if (responses['/countries'][i].continent === 'Africa') {
                    c.push(responses['/countries'][i].name);
                }
            }

            for (i = 0; i < responses['/cities'].length; i++) {
                for (j = 0; j < c.length; j++) {
                    if (responses['/cities'][i].country === c[j]) {
                        cc.push(responses['/cities'][i].name);
                    }
                }
            }

            for (i = 0; i < responses['/populations'].length; i++) {
                for (j = 0; j < cc.length; j++) {
                    if (responses['/populations'][i].name === cc[j]) {
                        p += responses['/populations'][i].count;
                    }
                }
            }

            console.log('Total population in African cities: ' + p);
        }
    };

    getData(request, callback);
}

// Вторая часть задачи:
function f() {
    var isCountry = false;
    var isCity = false;
    var cities = [];
    var name;
    function isCountryCallback(error, result) {
        name = prompt("Enter a name of a city or a country", "");
        if (name !== null) {            
            for (var i = 0; i < result.length; i++) {
                if (result[i].country == name) {
                    isCountry = true;
                    break;
                }
            } // Здесь мы знаем, страна ли это и показать численность её
            if (isCountry) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].country == name) {
                        cities.push(result[i].name)
                    }
                }
                getData('/populations', countryPopulation);
                isCountry = false;
                getData('/cities', isCountryCallback);
            } else {
                getData("/populations", callback);
                isCity = false;
                getData('/cities', isCountryCallback);
            }
        }               
    }
    function countryPopulation(error, result) {
        var p = 0;
        for (var i = 0; i < cities.length; i++) {
            for (var j = 0; j < result.length; j++) {
                if(result[j].name == cities[i]) {
                    p += result[j].count;
                }
            }
        }
        alert(name + " population: " + p);
    }
    function callback(error, result) {
        isCity = false;
        for (var i = 0; i < result.length; i++) {
            if (result[i].name == name) {
                isCity = true;
                alert("Population of " + result[i].name + ": " + result[i].count);
                break;
            }
        }
        if (!isCity) {
            alert("The city or country is not found.");
        }
    };
    getData('/cities', isCountryCallback);
}
f();