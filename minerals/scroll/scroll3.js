const range = (start, stop, step = 1) =>
        Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
function makeDomain(min, max, step) {
    return range(min, max, step)
}
function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
var locale = d3.timeFormatLocale({
    "dateTime": "%A, %e %B %Y г. %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
    "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
    "months": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    "shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
});
function getData(id){
    var value = $.ajax({ 
        url: id, 
        async: false
    }).responseJSON;
    return value;
}
function makeDailyStatistics(column) {
    var days = []
    covid_timeline[column].map(function(d,i) {
        if (i < covid_timeline[column].length-1) {
            days.push(covid_timeline[column][i+1]-covid_timeline[column][i])
        }
    })
    return days
}
function makeColumnChart(id,w) {
    
    var formatMillisecond = locale.format(".%L"),
        formatSecond = locale.format(":%S"),
        formatMinute = locale.format("%I:%M"),
        formatHour = locale.format("%I %p"),
        formatDay = locale.format("%a %d"),
        formatWeek = locale.format("%d %b"),
        formatMonth = locale.format("%b %Y"),
        formatYear = locale.format("%Y");

    function multiFormat(date) {
        return (d3.timeSecond(date) < date ? formatMillisecond
            : d3.timeMinute(date) < date ? formatSecond
            : d3.timeHour(date) < date ? formatMinute
            : d3.timeDay(date) < date ? formatHour
            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
            : d3.timeYear(date) < date ? formatMonth
            : formatYear)(date);
    }
    if (w < 450) {
        var start_width = w-20,
        ticks_amount = 100,
        start_height = 400;
    } else {
        var start_width = 600,
        ticks_amount = 50,
        start_height = 400;
    }  
    if (id=='deaths'){
        var json = makeDailyStatistics(id)
        var x_date = covid_timeline.dates.map(d => parseTodayDate(d))
        var plusMax = 100
        
        var color = '#455a64'
        var tooltipText = ' погибших за сутки</p>'
        var importedTickValues = x_date.filter(function(d,i) {if (i%ticks_amount == 0) {return d}})
    }
    var margin = {top: 10, right: 5, bottom: 40, left: 25},
        width = start_width - margin.left - margin.right,
        height = start_height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    d3.select("#deaths").html('')
    var svg = d3.select("#deaths")
        .append("svg")
        .attr('id','first_graph')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    if (width > 500) {
        var fontSize = '16px'
    } else {
        var fontSize = '12px'
    }
    svg.append("text")
        .attr("x", (width / 2) ) 
        .attr("y", 10)
        .attr("text-anchor", "middle")  
        .style("font-size", fontSize)
        .style("font-family", 'sans-serif')
        .text('Количество погибших от COVID-19 в Украине по дням');
    svg.append("text")
        .attr("x", 30 ) 
        .attr("y", height+35)
        .attr("text-anchor", "middle")  
        .style("font-size", '10px')
        .style("font-family", 'sans-serif')
        .style("fill", "#9e9e9e")
        .text('Данные: СНБО');
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(x_date)
        .padding(0.2);
    svg.append("g")
        .attr('class','ticksText')
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisBottom(x)
          .tickValues(importedTickValues)
          .tickFormat(locale.format("%d %b"))
          )
        .selectAll("text")
        
  
    var tooltipBee = d3.select(".simple_container")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "14px")
        .style("background-color", "white")
        .style("border", "1px solid #f5f5f5")
        .style("color", "black")
        .style("border-radius", "6px")
        .style("border-color", "black")
        .style("font", "12px sans-serif")
        .text("tooltip");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(json)+plusMax])
        .range([ height, 0]);
    
   
    function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(5)
    }
    svg.append("g")
        .attr('class','grid')
        .style('opacity','1')
        .call(make_y_gridlines()
            .tickSize(-width)
            .ticks(5)
        )
    svg.selectAll('.grid line')
        .style('stroke','#eeeeee')
        .style('stroke-opacity','1')
        .style('shape-rendering','crispEdges')
    
    svg.selectAll('.domain')
        .style('opacity','0')
    
    
    svg.selectAll("mybar")
    .data(json)
    .enter()
    .append("rect")
        .attr("x", function(d,i) { return x(x_date[i]); })
        .attr("width", x.bandwidth())
        .attr('class','every_day')
        .attr("fill", 'none')
        .attr("height", function(d,i) { return height - y(0); }) // always equal to 0
        .attr("y", function(d,i) { return y(0); })
        .on("mouseover", function(d,i) {
            tooltipBee.html('<p>'+dayMonth(x_date[i])+':</p><p>'+numberWithSpaces(d)+tooltipText)
            tooltipBee.style("visibility", "visible")
        })
        .on("mousemove", function() {
            return tooltipBee.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
            return tooltipBee.style("visibility", "hidden");
        })
    /* svg.selectAll("rect")
        .transition(t)
        .attr("y", function(d,i) {return y(json[i]); })
        .attr("height", function(d,i) { return height - y(json[i]); }) */
      d3.selectAll(".every_day")
          .transition().duration(20)
          .attr("fill", color)
          .delay(function(d,i){ return i *5 })
          .attr("y", function(d,i) {return y(json[i]); })
          .attr("height", function(d,i) { return height - y(json[i]); })
        

}
var export_json = [{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7100722,48.1547935]},"id": "Сторожинець_Чернівецька","pop": 14175,"deaths": 56,"per1000": 3.95},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.9836292,48.4320463]},"id": "Новоселиця_Чернівецька","pop": 7566,"deaths": 27,"per1000": 3.57},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.1973796,48.2521582]},"id": "Вижниця_Чернівецька","pop": 3917,"deaths": 13,"per1000": 3.32},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7704167,48.4413013]},"id": "Кіцмань_Чернівецька","pop": 6179,"deaths": 20,"per1000": 3.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.1628643,49.0890218]},"id": "Монастириська_Тернопільська","pop": 5551,"deaths": 18,"per1000": 3.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.4962545,48.6723982]},"id": "Городенка_Івано-Франківська","pop": 9070,"deaths": 29,"per1000": 3.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.082229,48.3135026]},"id": "Косів_Івано-Франківська","pop": 8490,"deaths": 27,"per1000": 3.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.4723243,48.7359203]},"id": "Перечин_Закарпатська","pop": 6644,"deaths": 19,"per1000": 2.86},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.2545099,48.1479286]},"id": "Герца_Чернівецька","pop": 2102,"deaths": 6,"per1000": 2.85},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.572467,48.017152]},"id": "Тячів_Закарпатська","pop": 8972,"deaths": 25,"per1000": 2.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.781765,50.2568193]},"id": "Яготин_Київська","pop": 19409,"deaths": 54,"per1000": 2.78},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.9757217,49.6492023]},"id": "Красилів_Хмельницька","pop": 18754,"deaths": 52,"per1000": 2.77},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.1150933,49.0306474]},"id": "Кам'янка_Черкаська","pop": 11328,"deaths": 30,"per1000": 2.65},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.7883933,47.309181]},"id": "Нова Одеса_Миколаївська","pop": 11726,"deaths": 31,"per1000": 2.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.9358367,48.2920787]},"id": "Чернівці_Чернівецька","pop": 267060,"deaths": 702,"per1000": 2.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.3454482,50.0994726]},"id": "Кам'янка-Бузька_Львівська","pop": 10630,"deaths": 28,"per1000": 2.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.5058522,48.3842974]},"id": "Вашківці_Чернівецька","pop": 5353,"deaths": 14,"per1000": 2.62},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.8192399,49.8620646]},"id": "Кагарлик_Київська","pop": 13461,"deaths": 35,"per1000": 2.6},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.3079782,49.4077736]},"id": "Ходорів_Львівська","pop": 9255,"deaths": 24,"per1000": 2.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.4053369,49.8247883]},"id": "Узин_Київська","pop": 11998,"deaths": 31,"per1000": 2.58},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.461353,49.3730489999999]},"id": "Красноград_Харківська","pop": 20272,"deaths": 52,"per1000": 2.57},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.8436802,48.525312]},"id": "Заставна_Чернівецька","pop": 7860,"deaths": 20,"per1000": 2.54},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.8519696,48.9001898]},"id": "Тисмениця_Івано-Франківська","pop": 9175,"deaths": 23,"per1000": 2.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.287883,48.6208]},"id": "Ужгород_Закарпатська","pop": 115512,"deaths": 288,"per1000": 2.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.4321477,49.2672882]},"id": "Деражня_Хмельницька","pop": 9969,"deaths": 24,"per1000": 2.41},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.0559924,50.1757487]},"id": "Шепетівка_Хмельницька","pop": 41189,"deaths": 99,"per1000": 2.4},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.4110397,48.4495656]},"id": "Сокиряни_Чернівецька","pop": 8748,"deaths": 21,"per1000": 2.4},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.6370954,48.1971868]},"id": "Берегове_Закарпатська","pop": 23571,"deaths": 55,"per1000": 2.33},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.6583812,49.3663943]},"id": "Тетіїв_Київська","pop": 12855,"deaths": 30,"per1000": 2.33},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.6027997,49.7055574]},"id": "Куп'янськ_Харківська","pop": 27584,"deaths": 64,"per1000": 2.32},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.8603864,48.8922474]},"id": "Дунаївці_Хмельницька","pop": 15914,"deaths": 37,"per1000": 2.32},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.372029,49.024011]},"id": "Калуш_Івано-Франківська","pop": 66140,"deaths": 152,"per1000": 2.3},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.6053332,49.9627279]},"id": "Миргород_Полтавська","pop": 39099,"deaths": 89,"per1000": 2.28},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.0302123,48.1463490999999]},"id": "Виноградів_Закарпатська","pop": 25395,"deaths": 58,"per1000": 2.28},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.066522,49.565935]},"id": "Решетилівка_Полтавська","pop": 9199,"deaths": 21,"per1000": 2.28},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.5900313,49.9106591]},"id": "Бердичів_Житомирська","pop": 74839,"deaths": 170,"per1000": 2.27},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.2101042,48.4340432]},"id": "Чоп_Закарпатська","pop": 8819,"deaths": 20,"per1000": 2.27},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.9110602,49.1037815]},"id": "Копичинці_Тернопільська","pop": 6627,"deaths": 15,"per1000": 2.26},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.9945828999999,46.975033]},"id": "Миколаїв_Миколаївська","pop": 480080,"deaths": 1081,"per1000": 2.25},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1421826,49.3853385]},"id": "Жидачів_Львівська","pop": 10672,"deaths": 24,"per1000": 2.25},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.323902,47.5734688]},"id": "Вознесенськ_Миколаївська","pop": 34404,"deaths": 77,"per1000": 2.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.5819174,48.481557]},"id": "Яремче_Івано-Франківська","pop": 8044,"deaths": 18,"per1000": 2.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.0488939,48.8006096]},"id": "Борщів_Тернопільська","pop": 10803,"deaths": 24,"per1000": 2.22},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.0089352,50.3815209]},"id": "Белз_Львівська","pop": 2257,"deaths": 5,"per1000": 2.22},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.8880994,51.0377956]},"id": "Ніжин_Чернігівська","pop": 68007,"deaths": 150,"per1000": 2.21},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.5387942,46.6187666999999]},"id": "Очаків_Миколаївська","pop": 14036,"deaths": 31,"per1000": 2.21},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.4878774,48.9481767]},"id": "Сєвєродонецьк_Луганська","pop": 102396,"deaths": 225,"per1000": 2.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.3859435,50.7438882]},"id": "Бобровиця_Чернігівська","pop": 10894,"deaths": 24,"per1000": 2.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.0181437,48.9014667]},"id": "Барвінкове_Харківська","pop": 8309,"deaths": 18,"per1000": 2.17},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.5699107,48.4464244]},"id": "Снятин_Івано-Франківська","pop": 9905,"deaths": 21,"per1000": 2.12},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.5593173,49.6692136]},"id": "Перемишляни_Львівська","pop": 6606,"deaths": 14,"per1000": 2.12},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.0539028,49.0149775]},"id": "Ватутіне_Черкаська","pop": 16200,"deaths": 34,"per1000": 2.1},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.711117,48.922633]},"id": "Івано-Франківськ_Івано-Франківська","pop": 237686,"deaths": 496,"per1000": 2.09},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7383108,48.6469926]},"id": "Заліщики_Тернопільська","pop": 9089,"deaths": 19,"per1000": 2.09},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.1310853,49.7967977]},"id": "Біла Церква_Київська","pop": 209238,"deaths": 433,"per1000": 2.07},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.0412055,48.5304917]},"id": "Коломия_Івано-Франківська","pop": 61265,"deaths": 126,"per1000": 2.06},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.7519532,50.3649126]},"id": "Угнів_Львівська","pop": 972,"deaths": 2,"per1000": 2.06},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.2604876,50.7696795]},"id": "Малин_Житомирська","pop": 25831,"deaths": 53,"per1000": 2.05},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.6298846,50.109938]},"id": "Обухів_Київська","pop": 33419,"deaths": 68,"per1000": 2.03},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.6826121,49.0768482]},"id": "Бар_Вінницька","pop": 15775,"deaths": 32,"per1000": 2.03},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.6480855,46.2952236]},"id": "Чорноморськ_Одеська","pop": 58934,"deaths": 117,"per1000": 1.99},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.3625487,48.0968029]},"id": "Українськ_Донецька","pop": 11035,"deaths": 22,"per1000": 1.99},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.0434322,46.9618362]},"id": "Запоріжжя_Запорізька","pop": 731922,"deaths": 1452,"per1000": 1.98},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1658808,50.7371757]},"id": "Нововолинськ_Волинська","pop": 51010,"deaths": 101,"per1000": 1.98},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.5931013,50.597831]},"id": "Новоград-Волинський_Житомирська","pop": 55790,"deaths": 110,"per1000": 1.97},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.298167,50.317117]},"id": "Боярка_Київська","pop": 35376,"deaths": 69,"per1000": 1.95},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.3860497,51.5489435]},"id": "Кролевець_Сумська","pop": 22665,"deaths": 44,"per1000": 1.94},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.9968812,50.369014]},"id": "Гадяч_Полтавська","pop": 23341,"deaths": 45,"per1000": 1.93},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.029717,49.839683]},"id": "Львів_Львівська","pop": 724314,"deaths": 1393,"per1000": 1.92},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.8363647,49.7149346]},"id": "Козятин_Вінницька","pop": 22951,"deaths": 44,"per1000": 1.92},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.280156,50.4863542]},"id": "Сокаль_Львівська","pop": 20882,"deaths": 40,"per1000": 1.92},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1479718,49.7844424]},"id": "Соснівка_Львівська","pop": 10991,"deaths": 21,"per1000": 1.91},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.2652371,50.9156638]},"id": "Рожище_Волинська","pop": 12710,"deaths": 24,"per1000": 1.89},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.2093072,49.5345161]},"id": "Волочиськ_Хмельницька","pop": 18604,"deaths": 35,"per1000": 1.88},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.5875246,50.9374317]},"id": "Носівка_Чернігівська","pop": 13310,"deaths": 25,"per1000": 1.88},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.0216369,50.0312719]},"id": "Андрушівка_Житомирська","pop": 8517,"deaths": 16,"per1000": 1.88},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.4682169,49.233083]},"id": "Вінниця_Вінницька","pop": 370707,"deaths": 693,"per1000": 1.87},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.95615,50.3482]},"id": "Бориспіль_Київська","pop": 63169,"deaths": 118,"per1000": 1.87},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.6292184,49.00833]},"id": "Горішні Плавні_Полтавська","pop": 50816,"deaths": 95,"per1000": 1.87},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.9049683999999,50.0637682]},"id": "Фастів_Київська","pop": 45393,"deaths": 85,"per1000": 1.87},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.58435,48.738967]},"id": "Краматорськ_Донецька","pop": 152120,"deaths": 283,"per1000": 1.86},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.9699903,49.0762064]},"id": "Звенигородка_Черкаська","pop": 16643,"deaths": 31,"per1000": 1.86},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.2128943,48.0545898]},"id": "Рахів_Закарпатська","pop": 15601,"deaths": 29,"per1000": 1.86},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.6586669,50.25465]},"id": "Житомир_Житомирська","pop": 264318,"deaths": 490,"per1000": 1.85},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.0280055,49.154057]},"id": "Турка_Львівська","pop": 7018,"deaths": 13,"per1000": 1.85},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.8501919,45.3501944]},"id": "Ізмаїл_Одеська","pop": 71299,"deaths": 131,"per1000": 1.84},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.4856785,50.5831258]},"id": "Вишгород_Київська","pop": 30997,"deaths": 57,"per1000": 1.84},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.4227839,51.252485]},"id": "Борзна_Чернігівська","pop": 9775,"deaths": 18,"per1000": 1.84},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2599968,49.3920229]},"id": "Глобине_Полтавська","pop": 9235,"deaths": 17,"per1000": 1.84},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.7981,50.9077]},"id": "Суми_Сумська","pop": 262119,"deaths": 479,"per1000": 1.83},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.9757792,49.5271733]},"id": "Миколаїв_Львівська","pop": 14787,"deaths": 27,"per1000": 1.83},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.2199454,50.3871767]},"id": "Червоноград_Львівська","pop": 65871,"deaths": 119,"per1000": 1.81},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.5040301,47.9422861]},"id": "Мар'їнка_Донецька","pop": 9376,"deaths": 17,"per1000": 1.81},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.297136,48.1475145]},"id": "Селидове_Донецька","pop": 22276,"deaths": 40,"per1000": 1.8},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.62688,49.2605667]},"id": "Бурштин_Івано-Франківська","pop": 14976,"deaths": 27,"per1000": 1.8},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7049422,49.3047733]},"id": "Теребовля_Тернопільська","pop": 13325,"deaths": 24,"per1000": 1.8},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.0871224,48.4691324]},"id": "Добропілля_Донецька","pop": 29129,"deaths": 52,"per1000": 1.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.4501543,50.0715832]},"id": "Переяслав_Київська","pop": 26786,"deaths": 48,"per1000": 1.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.0536232,48.5342262]},"id": "Білозерське_Донецька","pop": 15099,"deaths": 27,"per1000": 1.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.4697,49.751033]},"id": "Канів_Черкаська","pop": 23597,"deaths": 42,"per1000": 1.78},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.0432748,49.9657673]},"id": "Ржищів_Київська","pop": 7323,"deaths": 13,"per1000": 1.78},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.5366042,49.5889876]},"id": "Полтава_Полтавська","pop": 286649,"deaths": 507,"per1000": 1.77},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.1107867,50.3633974]},"id": "Берестечко_Волинська","pop": 1694,"deaths": 3,"per1000": 1.77},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.521108,50.3279292]},"id": "Острог_Рівненська","pop": 15457,"deaths": 27,"per1000": 1.75},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.1953871,49.1517927]},"id": "Кобеляки_Полтавська","pop": 9718,"deaths": 17,"per1000": 1.75},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.616867,46.635417]},"id": "Херсон_Херсонська","pop": 286958,"deaths": 500,"per1000": 1.74},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.5825364,48.6967162]},"id": "Кам'янець-Подільський_Хмельницька","pop": 98970,"deaths": 172,"per1000": 1.74},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.124263,48.0999765]},"id": "Кодима_Одеська","pop": 8639,"deaths": 15,"per1000": 1.74},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.6417699,50.9492572]},"id": "Коростень_Житомирська","pop": 62833,"deaths": 109,"per1000": 1.73},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.5759679,48.6211999]},"id": "Надвірна_Івано-Франківська","pop": 22522,"deaths": 39,"per1000": 1.73},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.6642903,49.7328752]},"id": "Сквира_Київська","pop": 15626,"deaths": 27,"per1000": 1.73},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.4566978,50.8323221]},"id": "Ківерці_Волинська","pop": 13971,"deaths": 24,"per1000": 1.72},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.9856251,48.441664]},"id": "Дніпро_Дніпропетровська","pop": 990724,"deaths": 1693,"per1000": 1.71},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.5154764,50.4037551]},"id": "Київ_м. Київ","pop": 2967360,"deaths": 5036,"per1000": 1.7},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.5710653,49.9315509]},"id": "Новояворівськ_Львівська","pop": 31218,"deaths": 53,"per1000": 1.7},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.506767,50.1224689]},"id": "Полонне_Хмельницька","pop": 20620,"deaths": 35,"per1000": 1.7},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.5767453,49.1664842]},"id": "Городок_Хмельницька","pop": 15919,"deaths": 27,"per1000": 1.7},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.0541431,50.3172235]},"id": "Коростишів_Житомирська","pop": 24822,"deaths": 42,"per1000": 1.69},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.1200067,49.4576263]},"id": "Карлівка_Полтавська","pop": 14292,"deaths": 24,"per1000": 1.68},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.4433606,48.9066145]},"id": "Лисичанськ_Луганська","pop": 96161,"deaths": 161,"per1000": 1.67},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.6611306,49.7821352]},"id": "Городок_Львівська","pop": 16168,"deaths": 27,"per1000": 1.67},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.325383,50.747233]},"id": "Луцьк_Волинська","pop": 217315,"deaths": 358,"per1000": 1.65},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.2665006,49.2121445]},"id": "Ізюм_Харківська","pop": 46653,"deaths": 77,"per1000": 1.65},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.9736471,50.0588756]},"id": "Жовква_Львівська","pop": 13899,"deaths": 23,"per1000": 1.65},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.2490235,47.779793]},"id": "Вугледар_Донецька","pop": 14616,"deaths": 24,"per1000": 1.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.391783,47.910483]},"id": "Кривий Ріг_Дніпропетровська","pop": 619278,"deaths": 1011,"per1000": 1.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7451835,50.4209188]},"id": "Дубно_Рівненська","pop": 37464,"deaths": 61,"per1000": 1.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.3644372,49.0140019]},"id": "Перещепине_Дніпропетровська","pop": 9805,"deaths": 16,"per1000": 1.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.5129163,49.0401779]},"id": "Сколе_Львівська","pop": 6146,"deaths": 10,"per1000": 1.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.3214234,46.1781552]},"id": "Білгород-Дністровський_Одеська","pop": 48674,"deaths": 79,"per1000": 1.62},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.9255483,49.2736853]},"id": "Старобільськ_Луганська","pop": 16650,"deaths": 27,"per1000": 1.62},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.3817159,49.064831]},"id": "Бучач_Тернопільська","pop": 12378,"deaths": 20,"per1000": 1.62},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.7117106,48.4493055]},"id": "Мукачево_Закарпатська","pop": 85796,"deaths": 138,"per1000": 1.61},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.7313165,49.1237705]},"id": "Галич_Івано-Франківська","pop": 6193,"deaths": 10,"per1000": 1.61},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.4271856,49.2912473]},"id": "Борислав_Львівська","pop": 33186,"deaths": 53,"per1000": 1.6},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2590348,50.3588723]},"id": "Лохвиця_Полтавська","pop": 11271,"deaths": 18,"per1000": 1.6},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.2168442,51.5240113]},"id": "Мена_Чернігівська","pop": 11243,"deaths": 18,"per1000": 1.6},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.578484,49.0440881]},"id": "Святогірськ_Донецька","pop": 4369,"deaths": 7,"per1000": 1.6},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.2893498999999,51.4982]},"id": "Чернігів_Чернігівська","pop": 286899,"deaths": 456,"per1000": 1.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.9027449,46.1145202]},"id": "Скадовськ_Херсонська","pop": 17640,"deaths": 28,"per1000": 1.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.6143107,45.6838431]},"id": "Болград_Одеська","pop": 15056,"deaths": 24,"per1000": 1.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.5331654,48.368954]},"id": "Бершадь_Вінницька","pop": 12552,"deaths": 20,"per1000": 1.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.3447822,48.9659719]},"id": "Новодружеськ_Луганська","pop": 6926,"deaths": 11,"per1000": 1.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.8354218,48.5884808]},"id": "Часів Яр_Донецька","pop": 12756,"deaths": 20,"per1000": 1.57},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.6106017,49.4099366]},"id": "Рогатин_Івано-Франківська","pop": 7716,"deaths": 12,"per1000": 1.56},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.8563795,48.6739771]},"id": "Тульчин_Вінницька","pop": 14871,"deaths": 23,"per1000": 1.55},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7723085,49.6669762]},"id": "Збараж_Тернопільська","pop": 13587,"deaths": 21,"per1000": 1.55},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.5072523,50.0005617]},"id": "Почаїв_Тернопільська","pop": 7737,"deaths": 12,"per1000": 1.55},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.6728902,46.4653009]},"id": "Одеса_Одеська","pop": 1017699,"deaths": 1570,"per1000": 1.54},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.8584805,49.4643925]},"id": "Балаклія_Харківська","pop": 27249,"deaths": 42,"per1000": 1.54},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.7276661,50.1078135]},"id": "Кременець_Тернопільська","pop": 20827,"deaths": 32,"per1000": 1.54},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.3595476,49.6944064]},"id": "Зміїв_Харківська","pop": 14254,"deaths": 22,"per1000": 1.54},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.9291621,49.0096425]},"id": "Яворів_Львівська","pop": 12946,"deaths": 20,"per1000": 1.54},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.3944506,49.0563905]},"id": "Славута_Хмельницька","pop": 35230,"deaths": 54,"per1000": 1.53},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.46433,50.3070969]},"id": "Березань_Київська","pop": 16383,"deaths": 25,"per1000": 1.53},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.0900525,49.9054766]},"id": "Дубляни_Львівська","pop": 9811,"deaths": 15,"per1000": 1.53},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.8288109,51.1954709]},"id": "Буринь_Сумська","pop": 8476,"deaths": 13,"per1000": 1.53},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.0037506,49.443994]},"id": "Старий Самбір_Львівська","pop": 6531,"deaths": 10,"per1000": 1.53},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.1847804,48.282193]},"id": "Покровськ_Донецька","pop": 61770,"deaths": 94,"per1000": 1.52},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.7044131,48.887593]},"id": "Тальне_Черкаська","pop": 13156,"deaths": 20,"per1000": 1.52},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.5123193,49.3580116]},"id": "Дрогобич_Львівська","pop": 75396,"deaths": 114,"per1000": 1.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.4007559,48.3461482]},"id": "Першотравенськ_Дніпропетровська","pop": 27892,"deaths": 42,"per1000": 1.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.5414504,49.30155]},"id": "Стебник_Львівська","pop": 20511,"deaths": 31,"per1000": 1.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.9948916,48.5428566999999]},"id": "Свалява_Закарпатська","pop": 17183,"deaths": 26,"per1000": 1.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.4413888,48.5780854]},"id": "Новодністровськ_Чернівецька","pop": 10622,"deaths": 16,"per1000": 1.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.3847498,50.4024665]},"id": "Заводське_Полтавська","pop": 7929,"deaths": 12,"per1000": 1.51},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.6053001,48.8532]},"id": "Слов'янськ_Донецька","pop": 108363,"deaths": 163,"per1000": 1.5},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.530686,47.7498395]},"id": "Подільськ_Одеська","pop": 40023,"deaths": 60,"per1000": 1.5},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.855245,48.3972873]},"id": "Торецьк_Донецька","pop": 32027,"deaths": 48,"per1000": 1.5},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.2480308,45.4650742]},"id": "Кілія_Одеська","pop": 19280,"deaths": 29,"per1000": 1.5},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.4973909,49.5619951]},"id": "Тараща_Київська","pop": 10017,"deaths": 15,"per1000": 1.5},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.6617808,49.0730544]},"id": "Чигирин_Черкаська","pop": 8655,"deaths": 13,"per1000": 1.5},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.7909,50.511083]},"id": "Бровари_Київська","pop": 108349,"deaths": 161,"per1000": 1.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.1478942,50.0788069]},"id": "Броди_Львівська","pop": 23454,"deaths": 35,"per1000": 1.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1435555,49.8122096]},"id": "Винники_Львівська","pop": 18099,"deaths": 27,"per1000": 1.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.9055618,49.7154835]},"id": "Пустомити_Львівська","pop": 9422,"deaths": 14,"per1000": 1.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.2510295,50.6233173]},"id": "Рівне_Рівненська","pop": 246003,"deaths": 364,"per1000": 1.48},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.9968117,48.8588029]},"id": "Тлумач_Івано-Франківська","pop": 8805,"deaths": 13,"per1000": 1.48},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.0990815,48.6765178]},"id": "Соледар_Донецька","pop": 10867,"deaths": 16,"per1000": 1.47},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.3256569,50.8481952]},"id": "Володимир-Волинський_Волинська","pop": 38340,"deaths": 56,"per1000": 1.46},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.3644004,47.9857775]},"id": "Березівка_Одеська","pop": 9581,"deaths": 14,"per1000": 1.46},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.5261534,48.3236506999999]},"id": "Синельникове_Дніпропетровська","pop": 30321,"deaths": 44,"per1000": 1.45},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.2566443,50.5089112]},"id": "Здолбунів_Рівненська","pop": 24806,"deaths": 36,"per1000": 1.45},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.901371,49.80941]},"id": "Золочів_Львівська","pop": 24109,"deaths": 35,"per1000": 1.45},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.4412263,47.4098736]},"id": "Баштанка_Миколаївська","pop": 12449,"deaths": 18,"per1000": 1.45},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.4800146,50.7525969]},"id": "Ромни_Сумська","pop": 38947,"deaths": 56,"per1000": 1.44},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.2906965,47.9865822]},"id": "Курахове_Донецька","pop": 18782,"deaths": 27,"per1000": 1.44},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.8543141,49.0702518]},"id": "Болехів_Івано-Франківська","pop": 10399,"deaths": 15,"per1000": 1.44},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.7629614,50.4965033]},"id": "Горохів_Волинська","pop": 9053,"deaths": 13,"per1000": 1.44},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.9980367,48.5986674]},"id": "Бахмут_Донецька","pop": 73212,"deaths": 105,"per1000": 1.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.5272187,48.6161912]},"id": "Дружківка_Донецька","pop": 55984,"deaths": 80,"per1000": 1.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.4235548,45.9788437]},"id": "Арциз_Одеська","pop": 14666,"deaths": 21,"per1000": 1.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.5958532,51.8911132]},"id": "Городня_Чернігівська","pop": 11852,"deaths": 17,"per1000": 1.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.262317,48.507933]},"id": "Кропивницький_Кіровоградська","pop": 225339,"deaths": 319,"per1000": 1.42},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.8884315,48.0451251]},"id": "Первомайськ_Миколаївська","pop": 64103,"deaths": 91,"per1000": 1.42},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.4903334,48.5097106]},"id": "Хотин_Чернівецька","pop": 9132,"deaths": 13,"per1000": 1.42},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.601983,51.3456549]},"id": "Сарни_Рівненська","pop": 29066,"deaths": 41,"per1000": 1.41},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.1610803,48.0581761]},"id": "Бобринець_Кіровоградська","pop": 10651,"deaths": 15,"per1000": 1.41},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.7999327,48.9965372]},"id": "Монастирище_Черкаська","pop": 8494,"deaths": 12,"per1000": 1.41},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.979303,49.4182106]},"id": "Хмельницький_Хмельницька","pop": 273713,"deaths": 383,"per1000": 1.4},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.6941624,48.411634]},"id": "П'ятихатки_Дніпропетровська","pop": 18619,"deaths": 26,"per1000": 1.4},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2526635,49.783653]},"id": "Хорол_Полтавська","pop": 12839,"deaths": 18,"per1000": 1.4},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.2469553,51.0747683]},"id": "Остер_Чернігівська","pop": 5727,"deaths": 8,"per1000": 1.4},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.3751403,49.0161212999999]},"id": "Рубіжне_Луганська","pop": 56785,"deaths": 79,"per1000": 1.39},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.6623829,47.4903821]},"id": "Енергодар_Запорізька","pop": 53343,"deaths": 74,"per1000": 1.39},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.368267,50.3919]},"id": "Вишневе_Київська","pop": 41820,"deaths": 58,"per1000": 1.39},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.2121595,49.7546828]},"id": "Старокостянтинів_Хмельницька","pop": 34455,"deaths": 48,"per1000": 1.39},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.6688212,50.2924464]},"id": "Баранівка_Житомирська","pop": 11497,"deaths": 16,"per1000": 1.39},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.336891,48.6482135]},"id": "Верхньодніпровськ_Дніпропетровська","pop": 15915,"deaths": 22,"per1000": 1.38},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.3175225,51.149402]},"id": "Білопілля_Сумська","pop": 15981,"deaths": 22,"per1000": 1.38},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.3699446,49.7905276]},"id": "Судова Вишня_Львівська","pop": 6509,"deaths": 9,"per1000": 1.38},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.8431343,49.2656076]},"id": "Стрий_Львівська","pop": 59730,"deaths": 82,"per1000": 1.37},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.9738949,48.8117212]},"id": "Христинівка_Черкаська","pop": 10246,"deaths": 14,"per1000": 1.37},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.1870814,48.4055242]},"id": "Білицьке_Донецька","pop": 8047,"deaths": 11,"per1000": 1.37},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.5105576,49.2760303]},"id": "Трускавець_Львівська","pop": 28647,"deaths": 39,"per1000": 1.36},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.9407539,49.9511113]},"id": "Люботин_Харківська","pop": 20646,"deaths": 28,"per1000": 1.36},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.2618527,49.4261119]},"id": "Корсунь-Шевченківський_Черкаська","pop": 17589,"deaths": 24,"per1000": 1.36},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.2065501,49.5207147]},"id": "Самбір_Львівська","pop": 34695,"deaths": 47,"per1000": 1.35},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.6729053,49.8197325999999]},"id": "Чугуїв_Харківська","pop": 31861,"deaths": 43,"per1000": 1.35},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.3727153,48.6282422]},"id": "Попасна_Луганська","pop": 19984,"deaths": 27,"per1000": 1.35},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.5146349,48.6928568]},"id": "Золоте_Луганська","pop": 13374,"deaths": 18,"per1000": 1.35},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.0503448,49.8060262]},"id": "Мерефа_Харківська","pop": 21598,"deaths": 29,"per1000": 1.34},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.959928,50.0576774]},"id": "Південне_Харківська","pop": 7461,"deaths": 10,"per1000": 1.34},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.594767,49.553517]},"id": "Тернопіль_Тернопільська","pop": 223462,"deaths": 297,"per1000": 1.33},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.0539427,49.4500588]},"id": "Черкаси_Черкаська","pop": 274762,"deaths": 364,"per1000": 1.32},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.9894691,49.665033]},"id": "Миронівка_Київська","pop": 11395,"deaths": 15,"per1000": 1.32},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.8772055,49.5405738]},"id": "Богуслав_Київська","pop": 16190,"deaths": 21,"per1000": 1.3},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.1840826,47.8227621]},"id": "Южноукраїнськ_Миколаївська","pop": 39404,"deaths": 51,"per1000": 1.29},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.2097768,48.3507226]},"id": "Родинське_Донецька","pop": 10066,"deaths": 13,"per1000": 1.29},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1444885,50.2423275]},"id": "Великі Мости_Львівська","pop": 6256,"deaths": 8,"per1000": 1.28},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.6980251,51.209018]},"id": "Ковель_Волинська","pop": 68240,"deaths": 87,"per1000": 1.27},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1290584,49.4745036]},"id": "Новий Розділ_Львівська","pop": 28304,"deaths": 36,"per1000": 1.27},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.6770961,48.7192002]},"id": "Знам'янка_Кіровоградська","pop": 22069,"deaths": 28,"per1000": 1.27},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.1177,50.055693]},"id": "Чуднів_Житомирська","pop": 5494,"deaths": 7,"per1000": 1.27},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.9892459,48.9764573]},"id": "Долина_Івано-Франківська","pop": 20716,"deaths": 26,"per1000": 1.26},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.7876745,47.5658802]},"id": "Оріхів_Запорізька","pop": 14278,"deaths": 18,"per1000": 1.26},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.098993,49.2412468]},"id": "Жашків_Черкаська","pop": 13451,"deaths": 17,"per1000": 1.26},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.5961736,45.4002994]},"id": "Вилкове_Одеська","pop": 7909,"deaths": 10,"per1000": 1.26},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.9078925,51.6708844]},"id": "Глухів_Сумська","pop": 32686,"deaths": 41,"per1000": 1.25},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.2176555,49.0422268]},"id": "Кремінна_Луганська","pop": 18618,"deaths": 23,"per1000": 1.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.7373521,50.1381207]},"id": "Українка_Київська","pop": 16204,"deaths": 20,"per1000": 1.23},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.2241571,48.6329614]},"id": "Новомосковськ_Дніпропетровська","pop": 70357,"deaths": 86,"per1000": 1.22},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.4273644,46.8433183]},"id": "Берислав_Херсонська","pop": 12250,"deaths": 15,"per1000": 1.22},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.4522028,50.118667]},"id": "Гребінка_Полтавська","pop": 10683,"deaths": 13,"per1000": 1.22},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.3703446,48.0535517]},"id": "Гірник_Донецька","pop": 10725,"deaths": 13,"per1000": 1.21},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.3974889,50.8579559]},"id": "Ічня_Чернігівська","pop": 10709,"deaths": 13,"per1000": 1.21},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.230383,49.9935]},"id": "Харків_Харківська","pop": 1443207,"deaths": 1738,"per1000": 1.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.8049964,48.9897585]},"id": "Лиман_Донецька","pop": 20768,"deaths": 25,"per1000": 1.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.9654363,50.4810642]},"id": "Тростянець_Сумська","pop": 19985,"deaths": 24,"per1000": 1.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.9361397,49.4438882]},"id": "Бережани_Тернопільська","pop": 17430,"deaths": 21,"per1000": 1.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.2016232,46.4894881]},"id": "Біляївка_Одеська","pop": 12526,"deaths": 15,"per1000": 1.2},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.543367,47.097133]},"id": "Маріуполь_Донецька","pop": 436569,"deaths": 520,"per1000": 1.19},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.9908442,50.0173168]},"id": "Лубни_Полтавська","pop": 45032,"deaths": 53,"per1000": 1.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.2625494,47.4726793]},"id": "Пологи_Запорізька","pop": 18658,"deaths": 22,"per1000": 1.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.3061973,49.5600739]},"id": "Новий Калинів_Львівська","pop": 4233,"deaths": 5,"per1000": 1.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.7075811,48.5239429]},"id": "Костянтинівка_Донецька","pop": 69817,"deaths": 82,"per1000": 1.17},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.5706453,51.5764734]},"id": "Дубровиця_Рівненська","pop": 9394,"deaths": 11,"per1000": 1.17},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.410033,49.065783]},"id": "Кременчук_Полтавська","pop": 219022,"deaths": 253,"per1000": 1.16},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.4972876,48.3451716]},"id": "Жовті Води_Дніпропетровська","pop": 43591,"deaths": 50,"per1000": 1.15},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.4423222,50.8790699]},"id": "Костопіль_Рівненська","pop": 31215,"deaths": 36,"per1000": 1.15},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.7929285,48.4584391]},"id": "Могилів-Подільський_Вінницька","pop": 30389,"deaths": 35,"per1000": 1.15},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.0364394,51.2329872]},"id": "Любомль_Волинська","pop": 10425,"deaths": 12,"per1000": 1.15},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.1614453,50.6227649]},"id": "Корець_Рівненська","pop": 6984,"deaths": 8,"per1000": 1.15},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.1085937,49.0390512]},"id": "Жмеринка_Вінницька","pop": 34353,"deaths": 39,"per1000": 1.14},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2050521,51.2409432]},"id": "Конотоп_Сумська","pop": 85603,"deaths": 97,"per1000": 1.13},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.0749436,46.8546237]},"id": "Роздільна_Одеська","pop": 17751,"deaths": 20,"per1000": 1.13},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.1313297,49.2744124]},"id": "Підгайці_Тернопільська","pop": 2654,"deaths": 3,"per1000": 1.13},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.4465327,49.2917766]},"id": "Городище_Черкаська","pop": 13433,"deaths": 15,"per1000": 1.12},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.8474081,48.9749521]},"id": "Немирів_Вінницька","pop": 11588,"deaths": 13,"per1000": 1.12},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.9165476,51.4706756]},"id": "Семенівка_Чернігівська","pop": 8052,"deaths": 9,"per1000": 1.12},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.7098365,47.2464085]},"id": "Токмак_Запорізька","pop": 30532,"deaths": 34,"per1000": 1.11},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.9329429,50.284234]},"id": "Вовчанськ_Харківська","pop": 17942,"deaths": 20,"per1000": 1.11},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.8646834,51.3345739]},"id": "Путивль_Сумська","pop": 15260,"deaths": 17,"per1000": 1.11},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.1149716,50.122577]},"id": "Шумськ_Тернопільська","pop": 5417,"deaths": 6,"per1000": 1.11},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.8058687,48.5765192]},"id": "Миколаївка_Донецька","pop": 14564,"deaths": 16,"per1000": 1.1},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.3196385,50.1770891]},"id": "Васильків_Київська","pop": 37507,"deaths": 41,"per1000": 1.09},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.2972476,48.1734632999999]},"id": "Хуст_Закарпатська","pop": 28321,"deaths": 31,"per1000": 1.09},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.9382714,49.5510263]},"id": "Хмільник_Вінницька","pop": 27398,"deaths": 30,"per1000": 1.09},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.8026512,49.0108843]},"id": "Чортків_Тернопільська","pop": 28686,"deaths": 31,"per1000": 1.08},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.4328125,47.9403225999999]},"id": "Вільнянськ_Запорізька","pop": 14809,"deaths": 16,"per1000": 1.08},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.2867265,47.4414731]},"id": "Василівка_Запорізька","pop": 12971,"deaths": 14,"per1000": 1.08},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.6955367,49.6287673]},"id": "Комарно_Львівська","pop": 3727,"deaths": 4,"per1000": 1.07},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.7072675,46.6199321]},"id": "Олешки_Херсонська","pop": 24520,"deaths": 26,"per1000": 1.06},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.4831419,47.5951141]},"id": "Волноваха_Донецька","pop": 21678,"deaths": 23,"per1000": 1.06},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.6059676,48.5169861]},"id": "Кам'янське_Дніпропетровська","pop": 231915,"deaths": 244,"per1000": 1.05},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.2530313,50.1285011]},"id": "Радивилів_Рівненська","pop": 10476,"deaths": 11,"per1000": 1.05},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.9938425,47.382476]},"id": "Дніпрорудне_Запорізька","pop": 18231,"deaths": 19,"per1000": 1.04},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.6094605,49.9693586]},"id": "Буськ_Львівська","pop": 8667,"deaths": 9,"per1000": 1.04},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.2948622,49.6376889]},"id": "Бібрка_Львівська","pop": 3849,"deaths": 4,"per1000": 1.04},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.9712877,49.4285053]},"id": "Скалат_Тернопільська","pop": 3833,"deaths": 4,"per1000": 1.04},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.3875825,50.5884714]},"id": "Прилуки_Чернігівська","pop": 53395,"deaths": 55,"per1000": 1.03},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.8068184,46.1784329]},"id": "Генічеськ_Херсонська","pop": 19424,"deaths": 20,"per1000": 1.03},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.2999396,49.0071487]},"id": "Привілля_Луганська","pop": 6826,"deaths": 7,"per1000": 1.03},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.156889,49.4154809]},"id": "Сватове_Луганська","pop": 16710,"deaths": 17,"per1000": 1.02},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.1000648,46.6240213]},"id": "Южне_Одеська","pop": 32724,"deaths": 33,"per1000": 1.01},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.9913264,47.714758]},"id": "Ананьїв_Одеська","pop": 7930,"deaths": 8,"per1000": 1.01},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.6582633,48.7907203]},"id": "Новомиргород_Кіровоградська","pop": 11024,"deaths": 11,"per1000": 1},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.0690462,48.7628865]},"id": "Шаргород_Вінницька","pop": 7035,"deaths": 7,"per1000": 1},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.8281141,50.1191124]},"id": "Ізяслав_Хмельницька","pop": 16336,"deaths": 16,"per1000": 0.98},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.750679,50.9996233]},"id": "Березне_Рівненська","pop": 13285,"deaths": 13,"per1000": 0.98},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.5159493,49.8215682]},"id": "Глиняни_Львівська","pop": 3050,"deaths": 3,"per1000": 0.98},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.6294299,48.6435934]},"id": "Мала Виска_Кіровоградська","pop": 10260,"deaths": 10,"per1000": 0.97},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.213517,50.5533329999999]},"id": "Буча_Київська","pop": 36284,"deaths": 35,"per1000": 0.96},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.6500845,50.3339731]},"id": "Нетішин_Хмельницька","pop": 36746,"deaths": 35,"per1000": 0.95},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[26.0022951,48.8482478]},"id": "Ланівці_Тернопільська","pop": 8401,"deaths": 8,"per1000": 0.95},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.1551215,50.8609275]},"id": "Устилуг_Волинська","pop": 2096,"deaths": 2,"per1000": 0.95},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.3586996,46.8550216]},"id": "Мелітополь_Запорізька","pop": 151948,"deaths": 141,"per1000": 0.93},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.2631562,48.3090506]},"id": "Мирноград_Донецька","pop": 47460,"deaths": 44,"per1000": 0.93},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.5038537,47.6968565]},"id": "Новий Буг_Миколаївська","pop": 15106,"deaths": 14,"per1000": 0.93},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.5402444,50.1636245]},"id": "Богодухів_Харківська","pop": 15020,"deaths": 14,"per1000": 0.93},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.6172155,50.2260935]},"id": "Рава-Руська_Львівська","pop": 8641,"deaths": 8,"per1000": 0.93},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.4747517,51.8620493]},"id": "Шостка_Сумська","pop": 74125,"deaths": 68,"per1000": 0.92},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.1155026,50.1097212]},"id": "Дергачі_Харківська","pop": 17655,"deaths": 16,"per1000": 0.91},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.0365566,49.6691121]},"id": "Золотоноша_Черкаська","pop": 27664,"deaths": 25,"per1000": 0.9},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.394815,47.56746]},"id": "Нікополь_Дніпропетровська","pop": 109122,"deaths": 97,"per1000": 0.89},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.4904643,50.5837638]},"id": "Лебедин_Сумська","pop": 24600,"deaths": 22,"per1000": 0.89},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.2476275,48.6838051]},"id": "Ладижин_Вінницька","pop": 22589,"deaths": 20,"per1000": 0.89},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.348201,49.0877258]},"id": "Гнівань_Вінницька","pop": 12330,"deaths": 11,"per1000": 0.89},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.3281404,46.5028082]},"id": "Теплодар_Одеська","pop": 10146,"deaths": 9,"per1000": 0.89},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.2193291,48.7501338999999]},"id": "Умань_Черкаська","pop": 82603,"deaths": 73,"per1000": 0.88},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.239783,50.51875]},"id": "Ірпінь_Київська","pop": 60084,"deaths": 53,"per1000": 0.88},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.8475792,51.3480412]},"id": "Вараш_Рівненська","pop": 42246,"deaths": 37,"per1000": 0.88},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.0869121,48.57248]},"id": "Підгородне_Дніпропетровська","pop": 19526,"deaths": 17,"per1000": 0.87},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.354122,46.7230781]},"id": "Приморськ_Запорізька","pop": 11497,"deaths": 10,"per1000": 0.87},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.5201269,46.5210948]},"id": "Гола Пристань_Херсонська","pop": 13971,"deaths": 12,"per1000": 0.86},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.268579,49.4863064]},"id": "Погребище_Вінницька","pop": 9514,"deaths": 8,"per1000": 0.84},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.3368211,48.2045408]},"id": "Новогродівка_Донецька","pop": 14481,"deaths": 12,"per1000": 0.83},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.2350917,48.3216669]},"id": "Благовіщенське_Кіровоградська","pop": 6002,"deaths": 5,"per1000": 0.83},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.2124704,49.3840978]},"id": "Первомайський_Харківська","pop": 29357,"deaths": 24,"per1000": 0.82},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.6345078,50.2836918]},"id": "Радехів_Львівська","pop": 9750,"deaths": 8,"per1000": 0.82},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.3812035,48.8139473]},"id": "Гайсин_Вінницька","pop": 25818,"deaths": 21,"per1000": 0.81},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.8329917,51.1828188]},"id": "Бахмач_Чернігівська","pop": 17410,"deaths": 14,"per1000": 0.8},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.5091505,48.0093421]},"id": "Красногорівка_Донецька","pop": 15055,"deaths": 12,"per1000": 0.8},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.3678207,46.7515251]},"id": "Нова Каховка_Херсонська","pop": 45422,"deaths": 36,"per1000": 0.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.5187617,48.3226457]},"id": "Новоукраїнка_Кіровоградська","pop": 16538,"deaths": 13,"per1000": 0.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.4060472,48.2465578]},"id": "Помічна_Кіровоградська","pop": 8874,"deaths": 7,"per1000": 0.79},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2643783,51.996921]},"id": "Новгород-Сіверський_Чернігівська","pop": 12862,"deaths": 10,"per1000": 0.78},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.8028968,51.3268314]},"id": "Овруч_Житомирська","pop": 15551,"deaths": 12,"per1000": 0.77},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[39.2311974,48.737247]},"id": "Щастя_Луганська","pop": 11743,"deaths": 9,"per1000": 0.77},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.5670045,50.1468568]},"id": "Лозова_Харківська","pop": 54618,"deaths": 41,"per1000": 0.75},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.1434666,49.660696]},"id": "Зборів_Тернопільська","pop": 6669,"deaths": 5,"per1000": 0.75},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.486531,49.6522215]},"id": "Рудки_Львівська","pop": 5322,"deaths": 4,"per1000": 0.75},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.5226562,49.448552]},"id": "Калинівка_Вінницька","pop": 18832,"deaths": 14,"per1000": 0.74},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[25.9034702,49.2030849]},"id": "Хоростків_Тернопільська","pop": 6738,"deaths": 5,"per1000": 0.74},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.4901963,46.8117208]},"id": "Каховка_Херсонська","pop": 35795,"deaths": 26,"per1000": 0.73},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.4167362,47.4870901]},"id": "Кам'янка-Дніпровська_Запорізька","pop": 12472,"deaths": 9,"per1000": 0.72},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.0212243,48.4801224]},"id": "Вільногірськ_Дніпропетровська","pop": 22675,"deaths": 16,"per1000": 0.71},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.2701847,45.4571774]},"id": "Рені_Одеська","pop": 18320,"deaths": 13,"per1000": 0.71},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.7860759,49.5739]},"id": "Добромиль_Львівська","pop": 4222,"deaths": 3,"per1000": 0.71},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.8674568,49.1557117]},"id": "Моршин_Львівська","pop": 5754,"deaths": 4,"per1000": 0.7},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.8034779,46.7737707]},"id": "Бердянськ_Запорізька","pop": 109187,"deaths": 75,"per1000": 0.69},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[27.6442211,51.220756]},"id": "Олевськ_Житомирська","pop": 10305,"deaths": 7,"per1000": 0.68},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.6105197,47.6489237]},"id": "Марганець_Дніпропетровська","pop": 46097,"deaths": 30,"per1000": 0.65},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.041894,48.3117809]},"id": "Іршава_Закарпатська","pop": 9259,"deaths": 6,"per1000": 0.65},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.2337369,50.4965282]},"id": "Радомишль_Житомирська","pop": 14109,"deaths": 9,"per1000": 0.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.2595792,51.7754831]},"id": "Корюківка_Чернігівська","pop": 12539,"deaths": 8,"per1000": 0.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[23.1469243,49.8026728]},"id": "Мостиська_Львівська","pop": 9396,"deaths": 6,"per1000": 0.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.3638533,50.2046322]},"id": "Зіньків_Полтавська","pop": 9387,"deaths": 6,"per1000": 0.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.9293828,52.0402452]},"id": "Дружба_Сумська","pop": 4654,"deaths": 3,"per1000": 0.64},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.0967875,48.6632704]},"id": "Олександрія_Кіровоградська","pop": 78366,"deaths": 49,"per1000": 0.63},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.9005644,50.3150962]},"id": "Охтирка_Сумська","pop": 47603,"deaths": 29,"per1000": 0.61},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[30.7457125,51.5221889]},"id": "Славутич_Київська","pop": 24784,"deaths": 15,"per1000": 0.61},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.0488875,49.2255122]},"id": "Липовець_Вінницька","pop": 8181,"deaths": 5,"per1000": 0.61},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[36.2732383,47.6607145]},"id": "Гуляйполе_Запорізька","pop": 13262,"deaths": 8,"per1000": 0.6},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.5070927,50.2394849]},"id": "Пирятин_Полтавська","pop": 15240,"deaths": 9,"per1000": 0.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.7205403,47.660528]},"id": "Апостолове_Дніпропетровська","pop": 13455,"deaths": 8,"per1000": 0.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.8977049,48.3692563]},"id": "Залізне_Донецька","pop": 5105,"deaths": 3,"per1000": 0.59},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.8686351,48.3367137]},"id": "Гайворон_Кіровоградська","pop": 14344,"deaths": 8,"per1000": 0.56},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.494632,48.7398662]},"id": "Гірське_Луганська","pop": 9436,"deaths": 5,"per1000": 0.53},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2284693,49.0496835]},"id": "Світловодськ_Кіровоградська","pop": 44466,"deaths": 23,"per1000": 0.52},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.9032574,48.5294478]},"id": "Павлоград_Дніпропетровська","pop": 104225,"deaths": 51,"per1000": 0.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.7491336,48.136596]},"id": "Авдіївка_Донецька","pop": 32436,"deaths": 16,"per1000": 0.49},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.4022422,48.9969392]},"id": "Шпола_Черкаська","pop": 16616,"deaths": 8,"per1000": 0.48},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.8061775,47.07537]},"id": "Снігурівка_Миколаївська","pop": 12432,"deaths": 6,"per1000": 0.48},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.4216856,46.7528018]},"id": "Таврійськ_Херсонська","pop": 10360,"deaths": 5,"per1000": 0.48},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.5958744,47.2090577]},"id": "Молочанськ_Запорізька","pop": 6327,"deaths": 3,"per1000": 0.47},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.8522329,49.227717]},"id": "Сміла_Черкаська","pop": 66972,"deaths": 31,"per1000": 0.46},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.6145762,45.8391132]},"id": "Татарбунари_Одеська","pop": 10945,"deaths": 5,"per1000": 0.46},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.1047909,48.873935]},"id": "Сіверськ_Донецька","pop": 11231,"deaths": 5,"per1000": 0.45},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.7658685,48.1132559]},"id": "Долинська_Кіровоградська","pop": 18639,"deaths": 8,"per1000": 0.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.2327186,51.1657844]},"id": "Ворожба_Сумська","pop": 6910,"deaths": 3,"per1000": 0.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.0412051,52.1837429]},"id": "Середина-Буда_Сумська","pop": 7022,"deaths": 3,"per1000": 0.43},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.1054257,47.6558968]},"id": "Покров_Дніпропетровська","pop": 38570,"deaths": 16,"per1000": 0.41},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[34.2526605,48.4841418]},"id": "Верхівцеве_Дніпропетровська","pop": 10148,"deaths": 4,"per1000": 0.39},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[31.946738,51.8178825]},"id": "Сновськ_Чернігівська","pop": 10928,"deaths": 4,"per1000": 0.37},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.2092738,49.1040007]},"id": "Іллінці_Вінницька","pop": 11219,"deaths": 4,"per1000": 0.36},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[24.9688475,51.6288118]},"id": "Камінь-Каширський_Волинська","pop": 12477,"deaths": 3,"per1000": 0.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[22.8520262,49.5333606]},"id": "Хирів_Львівська","pop": 4184,"deaths": 1,"per1000": 0.24},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[35.6206178,49.8387221]},"id": "Валки_Харківська","pop": 8783,"deaths": 2,"per1000": 0.23},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[29.6288401,47.9370871]},"id": "Балта_Одеська","pop": 18242,"deaths": 4,"per1000": 0.22},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[33.2050667,48.0771576]},"id": "Тернівка_Дніпропетровська","pop": 27635,"deaths": 5,"per1000": 0.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[28.2765218,48.2441219]},"id": "Ямпіль_Вінницька","pop": 10879,"deaths": 2,"per1000": 0.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.220428,48.4346796]},"id": "Світлодарськ_Донецька","pop": 11421,"deaths": 2,"per1000": 0.18},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.80285,48.015883]},"id": "Донецьк_Донецька","pop": 908456,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.029633,48.3071]},"id": "Горлівка_Донецька","pop": 242224,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.2082157,48.2368992]},"id": "Єнакієве_Донецька","pop": 77355,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.9666901,48.0459557]},"id": "Макіївка_Донецька","pop": 341362,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.45053,48.0486753]},"id": "Шахтарськ_Донецька","pop": 48547,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[37.8765943999999,48.1221425]},"id": "Ясинувата_Донецька","pop": 34394,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[39.307815,48.574041]},"id": "Луганськ_Луганська","pop": 401297,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[39.1949395,48.5861652]},"id": "Олександрівськ_Луганська","pop": 6444,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[38.4567752,49.2300419]},"id": "Голубівка_Луганська","pop": 26967,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[39.6191278,49.0798389]},"id": "Первомайськ_Луганська","pop": 36529,"deaths": 0,"per1000": 0},
{'type': "Feature", 'geometry':{'type': "Point", "coordinates":[32.8797802,51.3412504]},"id": "Батурин_Чернігівська","pop": 2492,"deaths": 0,"per1000": 0}]

width = getWidth(d3.select('#graph').node().offsetWidth),
height = getHeight(d3.select('#graph').node().offsetWidth)
function getWidth(w) {
    if (w < 600) {
        return w-10
    } else {
        return 600
    }
}
function getHeight(w) {
    if (w < 600) {
        return w/1.3
    } else {
        return 450
    }
}
function getProjection(width,height) {
    if (width < 450) {var scale = 980} else {var scale = 1900}
    return d3.geoMercator()
    .scale(scale)
    .rotate([-30.02,0])
    .center([0, 50])
    .translate([width/2.2,height/3]);
}
function drawMap(g,projection) {
    return g.selectAll("path")
    .data(ukraine)
    .enter()
    .append("path")
    .transition().duration(250)
    .delay(function(d,i){ return i * 10 })
    .attr("fill", "#f5f5f5")
    .attr("stroke", "#9e9e9e")
    .attr("stroke-width", "0.5px")
    .attr("d", d3.geoPath().projection(projection) )
    .attr("class", "district");
}
function getRadius(width,id) {
    if (width < 450 || id == 2) {var radiusMaxValue = 4} else {var radiusMaxValue = 8}
    if (id == 3) {
        var values = export_json.map(d=>d.pop)
    } else {
        var values = export_json.map(d => d.per1000)
    }
    return d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([3,radiusMaxValue]) 
}
function drawCircles(projection,radiusSize,id,tooltipBee) {
    var svg = d3.select(".container-1 #graph svg")
    var cities_mer = svg.append("g").attr('class','cities_mer');
    cities_mer.selectAll(".container-1 circle")
        .data(export_json)
        .enter()
        .append("circle")
        .attr("fill", 'none')
        .attr("stroke-width", ".5px")
        .attr("r", 0)
        .attr("cx", function(d){ 
            return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0] 
        })
        .attr("cy", function(d){ return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1] })
        .attr("class", "dot")
        .on("mouseover", function(d) {
            tooltipBee.html(
                '<h4>'+d.id.split('_')[0]+', '+d.id.split('_')[1]+'</h4>'+
                '<p>'+numberWithSpaces(d.pop)+' жителей</p>'+
                '<p>'+numberWithSpaces(d.deaths)+' погибших</p>'+
                '<p>'+numberWithSpaces(d.per1000)+' погибших на 1000 жителей</p>'
                )
            tooltipBee.style("visibility", "visible")
        })
        .on("mousemove", function() {
            return tooltipBee.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
            return tooltipBee.style("visibility", "hidden");
        });
    if (id == 2) {
        var values = export_json.map(d => d.per1000)
        var color = d3.scaleThreshold()
            .domain(makeDomain(0,d3.max(values),.4))
            .range(["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"]);
        cities_mer.selectAll(".container-1 circle")
            .transition().duration(100)
            .delay(function(d,i){ return i * 2 })
            .attr("r",function(d) { return radiusSize(d.per1000) })
            .attr("stroke", "none")
            .attr("fill", function(d){ 
                if (d.per1000 > 2) {
                    return color(d.per1000)
                } else {
                    return 'none'
                }
            })
    } else if (id == 1) {
        d3.selectAll(".container-1 circle")
            .transition().duration(1000)
            .delay(function(d,i){ return i * 5 })
            .attr("stroke", "#00838f")
            .attr("fill", '#4dd0e1')
            .attr("r",function(d) { return radiusSize(d.per1000) })
    }
    
}
function mapZooming(id,zoom) {
    if (id == 1) {
        var city = [31.1,49.96],
            delta_height = 3,
            svgScale = 1
    } else if (id == 2) {
        var city = [25.7704167, 48.4413013],
            delta_height = 1,
            svgScale = 2.4
    } else if(id == 3) {
        var city = [31.1,48.96],
            delta_height = 2,
            svgScale = 1
    }
    function transform(x,y,scale) {
        return d3.zoomIdentity
            .translate(width/2, height / delta_height)
            .scale(scale) 
            .translate(-x,-y);
        
    }
    var projection = getProjection(width,height)
    var coordinates = projection(city);
    
    var svg = d3.select(".container-1 #graph svg .ukraine_map")
    svg.transition()
        .delay(50)
        .duration(1000)
        .call(zoom.transform, transform(coordinates[0],coordinates[1],svgScale))
}
function drawDots(width,index){
    var amount = [500,130,184,494,570]
    var peopleAmount = [616835,109112,50000]
    var data = []
    var position = makeDomain(0,amount.slice(index,index+1),1)
    

    var svg = d3.select(".container-1 #graph svg")
    var dots = document.getElementsByClassName('death_dots')
    if (window.innerHeight < 600) {
        var height = window.innerHeight-10
    } else {
        var height = 600
    }
    if (width < 600){
        var cyValue = 58
        svg.attr('height',height)
        var heightSVG = 800
        var maxValue = Math.round((100) / 16)
        var cxValues = [15,42,75,109,145]
        var xTextValues = [12,37,66,98,133]
    } else {
        var cyValue = 40
        svg.attr('height',height)
        var heightSVG = 1300
        var maxValue = Math.round((100) / 10)
        var cxValues = [25,63,115,168,220]
        var xTextValues = [25,65,110,155,200]
    }
    var cxValue = cxValues.slice(index,index+1)
    var cxValue_copy = $.extend( true, {}, cxValues.slice(index,index+1) );
    if(dots.length == 0) {
        var g = svg.append("g").attr('class','death_dots index'+String(index)).attr('width',width);
    } else if (index == 0 && dots.length != 0) {
        var g = svg.select('.index'+String(index)).attr('width',width)//.attr('transform','translate('+cxValue_copy[0]+',0)');
    } else if (index != 0 && document.getElementsByClassName('index'+String(index)).length == 0) {
        var g = svg.append("g").attr('class','death_dots index'+String(index)).attr('width',width).attr('transform','translate('+cxValue_copy[0]+',0)');
    } else if (document.getElementsByClassName('index'+String(index)).length != 0 && index != 0) {
        var g = svg.select('.index'+String(index)).attr('width',width).attr('transform','translate('+cxValue_copy[0]+',0)');
    }else {
        var g = d3.select('.death_dots');
        g.selectAll(".disappear5")
            .transition().duration(200)
            .delay(function(d,i){ return i  })
            .attr("r", 4)
    }
    var points_values = [
            {from:0,to:500,name:'Погибло от COVID',color:'#f44336',stroke:'#b71c1c'},
            {from:0,to:130,name:'Погибло из-за войны с 2014',color:'#f44336',stroke:'#b71c1c'},
            {from:0,to:184,name:'Студентов в КНУ им. Шевченко',color:'#f44336',stroke:'#b71c1c'},
            {from:0,to:494,name:'Жителей Припяти в 1986',color:'#f44336',stroke:'#b71c1c'},
            {from:0,to:570,name:'Посетителей Книжного Арсенала в 2019',color:'#f44336',stroke:'#b71c1c'}
            //{from:0,to:700,name:'Вместимость Олимпийского',color:'#f44336',stroke:'#b71c1c'}
            //{from:0,to:570,name:'Посетителей Книжного Арсенала в 2019',color:'#f44336',stroke:'#b71c1c'},
    ]
    var points = points_values.slice(index,index+1)
    
    position.map(function(d,i) {
        if (i % maxValue == 0) {
            cyValue += 5
            cxValue = cxValue_copy[0]
        } else {
            cxValue += 10//14
        }
        var point = points.filter(d=> i >= d.from && i < d.to)
        
        data.push({x:cxValue,y:cyValue,color:point[0].color,stroke:point[0].stroke,name:point[0].name})
    })
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0, //parseFloat(text.attr("dy")),
                tspan = text.text(null)
                            .append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                }
            }
        });
    }
    g.append("text")
        .attr("x", xTextValues.slice(index,index+1)) 
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("font-size", '12px')
        .style("font-weight", 'bold')
        .style("font-family", 'sans-serif')
        .text(points[0].name)
        .call(wrap,40);

    
    var x = d3.scaleLinear()
        .domain([0, 110])
        .range([0, 100]); 
    var y = d3.scaleLinear()
        .domain([0, 700])
        .range([0, heightSVG]);
    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("fill", function(d){ return d.color })
            .attr("stroke", function(d){ return d.stroke })
            .attr("id", function(d,i){ return 'c'+String(i) })
            .attr("class", 'circles_index'+String(index))
            .attr("cx", function(d){ return x(d.x) })
            .attr("cy", function(d){ return y(d.y) })
            .transition().duration(200)
            .delay(function(d,i){ return i * 2 })
            .attr("r", 4)
   
    var annotations = [{
        note: {
            title: 'Одна точка — 100 смертей',
            x: 20,
            align: "left"
        },
        color: 'black',
        x: 0, y: y(70),
        dy: 0,
        dx: 10
    }]
    const makeAnnotations = d3.annotation()
        .editMode(false)
        .notePadding(-7)
        .type(d3.annotationLabel)
        .annotations(annotations)
    var annotations = document.getElementsByClassName('annotations')
    if(annotations.length == 0) {
        d3.select(".container-1 #graph svg .death_dots.index1")
            .append("g")
            .style('font-size','14px')
            .style('font-family','sans-serif')
            .call(makeAnnotations)
    }
    }
    function drawBarChart(w) {
        if (w < 450) {
            var start_width = w-10,
            start_height = window.innerHeight-50;
        } else {
            var start_width = 600,
            start_height = 400;
        }  
        var data = [
            {"reason":"Болезни сердца", "value": 408721},
            {"reason":"Рак", "value": 77862},
            {"reason":"Внешние причины", "value": 28062},
            {"reason":"Болезни пищеварения", "value": 24215},
            {"reason":"COVID-19", "value": 20709},
            {"reason":"Не определено", "value": 20087},
            {"reason":"Болезни органов дыхания", "value": 16705},
            {"reason":"Инфекционные болезни", "value": 6822},
            {"reason":"Другое", "value": 13627}
        ]
        var margin = {top: 20, right: 10, bottom: 40, left: 140},
            width = start_width - margin.left - margin.right,
            height = start_height - margin.top - margin.bottom;

        var svg = d3.select(".container-1 #graph svg")
        svg.attr('height',600)
        svg.append("text")
            .attr("x", (width / 2) ) 
            .attr("y", 10)
            .attr("text-anchor", "start")  
            .attr("class", "bar_title")
            .style("font-size", '12px')
            .style("font-family", 'sans-serif')
            .text('Причины смертей в Украине в 2020');
        svg.append("text")
            .attr("x", start_width-50) 
            .attr("y", start_height)
            .attr("text-anchor", "middle")  
            .attr("class", "subtitle title")
            .style("font-size", '10px')
            .style("font-family", 'sans-serif')
            .style("fill", "#9e9e9e")
            .text('Данные: Госстат');
        var dots = document.getElementsByClassName('death_reason')
        if (dots.length == 0) {
            var g = svg.append("g").attr('class','death_reason');
            g.attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
                var x = d3.scaleLinear()
                .domain([0, 409721])
                .range([ 0, width]);
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("id", "xAxis")
                .call(d3.axisBottom(x).tickValues(makeDomain(0,450000,100000)))
                
    
            var y = d3.scaleBand()
                .range([ 0, height ])
                .domain(data.map(function(d) { return d.reason; }))
                .padding(.3);
            g.append("g")
                .attr("id", "yAxis")   
                .call(d3.axisLeft(y))
    
            //Bars
            g.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.reason); })
                .attr("height", y.bandwidth() )
                .attr("fill", function(d) {
                    if (d.reason == 'COVID-19') {
                        return '#99000d'
                    } else {
                        return "#4dd0e1"
                    }
                })
                .transition().duration(500)
                .delay(function(d,i){ return i * 100 })
                .attr("width", function(d) { return x(d.value); })
                
                
            g.selectAll("mybar")
                .data(data)
                .enter()
                .append("svg:text")
                .attr('class','value_text')
                .text(function(d,i){
                    return numberWithSpaces(d.value)
                })
                .attr("y", function(d,i) { return y(d.reason)+18; })
                .attr("x", function(d,i) { 
                    if (x(d.value) < 55) {
                        return x(d.value)+26; 
                    } else{ 
                        return x(d.value)-30; 
                    }  
                })
                .attr("text-anchor","middle")
                .attr('font-family','Arial')
                .attr('fill',function(d,i) { 
                    if (x(d.value) < 55) {
                        return 'black'
                    } else if (d.reason == 'COVID-19') {
                        return '#99000d'
                    } else { 
                        return 'white'
                    }  
                })
                .attr('font-size','14px');
        } else {
            updateBarChart(w,data)
        }
        
        

    }
    var winterData = [
        {"reason":"Болезни сердца", "value": 111259},
        {"reason":"Рак", "value": 18363},
        {"reason":"COVID-19", "value": 15040},
        {"reason":"Внешние причины", "value": 7043},
        {"reason":"Болезни пищеварения", "value": 6294},
        {"reason":"Болезни органов дыхания", "value": 5713},
        {"reason":"Не определено", "value": 5416},
        {"reason":"Инфекционные болезни", "value": 1614},
        {"reason":"Другое", "value": 3303}
    ]
    function updateBarChart(w,data) {
        if (w < 450) {
            var start_width = w-10,
            start_height = window.innerHeight-50;
        } else {
            var start_width = 600,
            start_height = 400;
        }  
        var margin = {top: 20, right: 10, bottom: 40, left: 140},
            width = start_width - margin.left - margin.right,
            height = start_height - margin.top - margin.bottom;
        var svg = d3.select(".container-1 #graph svg")
        svg.attr('height',600)
        var dots = document.getElementsByClassName('death_reason')
        if(dots.length == 0) {
            drawBarChart(width)
        } else {
            var g = svg.select('.death_reason');
        }
        var values = data.map(d=>d.value)
        if (data[0].value != 408721) {
            var step = 20000
        } else {
            var step = 100000
        }
        var x = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([ 0, width]);
            
        g.selectAll('#xAxis')
            .transition().duration(1000)
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues(makeDomain(0,d3.max(values),step)))

        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.reason; }))
            .padding(.3);
        g.selectAll("#yAxis")
            .transition().duration(800)
            .delay(function(d,i){ return i * 100 })
            .call(d3.axisLeft(y)) 
        g.selectAll('rect')
            .transition().duration(800)
            .attr("width", function(d,i) {return x(data.filter(v=>v.reason == d.reason)[0].value); })
            .attr("x", x(0))
            .attr("fill", function(d) {
                if (data.filter(v=>v.reason == d.reason)[0].reason == 'COVID-19') {
                    return '#99000d'
                } else {
                    return "#4dd0e1"
                }
            })
            .attr("y", function(d,i) { return y(data.filter(v=>v.reason == d.reason)[0].reason); })
            .attr("height", y.bandwidth())
            
        g.selectAll('.value_text')
            .transition().duration(800)
            .text(function(d,i){
                return numberWithSpaces(data.filter(v=>v.reason == d.reason)[0].value)
            })
            .attr("y", function(d,i) { return y(data.filter(v=>v.reason == d.reason)[0].reason)+18; })
            .attr("x", function(d,i) { 
                if (x(data.filter(v=>v.reason == d.reason)[0].value) < 65) {
                    return x(data.filter(v=>v.reason == d.reason)[0].value)+26; 
                } else{ 
                    return x(data.filter(v=>v.reason == d.reason)[0].value)-30; 
                }  
            })
            .attr('fill',function(d,i) { 
                if (x(data.filter(v=>v.reason == d.reason)[0].value) < 65) {
                    return 'black'
                } else { 
                    return 'white'
                }  
            })
    }
    //var ukraine = getData('ukraine.json').features;
    var ukraine = getData('https://cdn.jsdelivr.net/gh/liga-net/few-projects/local_elections/ukraine.json').features;
    
    var todayDateFormat = d3.timeFormat("%Y-%m-%d");
    var parseTodayDate = d3.timeParse("%Y-%m-%d");
    var dayMonth = locale.format("%d %B")
    var parseTime = d3.timeParse("%m/%d/%Y");
    var covid_timeline = getData("https://cdn.jsdelivr.net/gh/liga-net/few-projects/50deaths/maindata.json");
    
    
    var oldWidth = 0
    function render(){
        if (oldWidth == innerWidth) return
        oldWidth = innerWidth

        var width = height = d3.select('#graph').node().offsetWidth
        var r = 40

        width = getWidth(d3.select('#graph').node().offsetWidth),
        height = getHeight(d3.select('#graph').node().offsetWidth)
        makeColumnChart('deaths',width)
        var svg = d3.select('#graph').html('')
            .append('svg')
            .attrs({width: width, height: height})

        var gs = d3.graphScroll()
            .offset(500)
            .container(d3.select('.container-1'))
            .graph(d3.selectAll('container-1 #graph'))
            .eventId('uniqueId1') 
            .sections(d3.selectAll('.container-1 #sections > div'))
            .on('active', function(index){
                width = getWidth(d3.select('#graph').node().offsetWidth),
                height = getHeight(d3.select('#graph').node().offsetWidth)
                var realIndex = index
                
                var tooltipBee = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .attr('class','tooltip')
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("padding", "14px")
                    .style("background-color", "white")
                    .style("border", "1px solid #f5f5f5")
                    .style("color", "black")
                    .style("border-radius", "6px")
                    .style("border-color", "black")
                    .style("font", "12px sans-serif")
                    .text("tooltip");
                if (index == 0) {
                    var ukraine_map = document.getElementsByClassName('ukraine_map')

                    if (ukraine_map.length == 0) {

                        var projection = getProjection(width,height)

                        var svg = d3.select(".container-1 #graph svg")
                        
                        svg.append("text")
                            .attr("x", (width / 2) ) 
                            .attr("y", 10)
                            .attr("text-anchor", "middle")
                            .attr("class", "title")
                            .attr("id", "head_title")
                            .style("font-size", '12px')
                            .style("font-family", 'sans-serif')
                            .text('Количество погибших от COVID-19 в городах Украины');
                        svg.append("text")
                            .attr("x", width-50) 
                            .attr("y", height-35)
                            .attr("text-anchor", "middle")  
                            .attr("class", "subtitle title")
                            .style("font-size", '10px')
                            .style("font-family", 'sans-serif')
                            .style("fill", "#9e9e9e")
                            .text('Данные: СНБО');
                        var g = svg.append("g").attr('class','ukraine_map');
                        
                        drawMap(g,projection)
                        
                        var radiusSize = getRadius(width,1)
                        
                        drawCircles(projection,radiusSize,1,tooltipBee)

                    } else {
                        var projection = getProjection(width,height)

                        var radiusSize = getRadius(width,1)
                        
                        var cities_mer_circles = document.getElementsByClassName('cities_mer')
                        if (cities_mer_circles.length == 0) {
                            drawCircles(projection,radiusSize,1)
                        }

                        function zoomed() {
                            
                            var svg = d3.select(".container-1 #graph svg")
                            d3.select(".container-1 #graph").style('top','100px')
                            var title = document.getElementsByClassName('title')
                            if (title.length == 0) {
                                svg.append("text")
                                    .attr("x", (width / 2) ) 
                                    .attr("y", 30)
                                    .attr("text-anchor", "middle")  
                                    .attr("class", "title")
                                    .style("font-size", '12px')
                                    .style("font-family", 'sans-serif')
                                    .text('Количество погибших от COVID-19 в городах Украины');
                                svg.append("text")
                                    .attr("x", width-50) 
                                    .attr("y", height-35)
                                    .attr("text-anchor", "middle")  
                                    .attr("class", "subtitle title")
                                    .style("font-size", '10px')
                                    .style("font-family", 'sans-serif')
                                    .style("fill", "#9e9e9e")
                                    .text('Данные: СНБО');
                            }
                            
                            var g = svg.select(".ukraine_map");
                            g.selectAll('path')
                                .attr('transform', d3.event.transform);
                            
                            var cities_mer = svg.select(".cities_mer");
                            cities_mer.selectAll(".container-1 circle")
                                .attr('transform', d3.event.transform);
                            
                            var radiusSize = getRadius(width,1)

                            cities_mer.selectAll(".container-1 circle")
                                .transition().duration(200)
                                .delay(function(d,i){ return i * 2 })
                                .attr("fill", '#4dd0e1')
                                .attr("stroke", "#00838f")
                                .attr("r",function(d) { return radiusSize(d.per1000) })

                        }
                        const zoom = d3.zoom()
                            .on('zoom', zoomed);
                            
                        mapZooming(1,zoom)
                        
                    }
                    
                } else if (realIndex == 2) {
                    var svg = d3.select(".container-1 #graph svg")
                    d3.selectAll(".bar_title").attr('opacity',0)
                    d3.selectAll(".subtitle").attr('opacity',0)
                    var dots = document.getElementsByClassName('death_reason')
                    if(dots.length != 0) {
                        d3.selectAll('.death_reason').transition().duration(1000).attr('opacity',0)
                    }
                    var projection = getProjection(width,height)
                    d3.selectAll(".title").transition().duration(500).style('opacity',0)
                    d3.select("#container #tooltip").html('')
                    var ukraine_map = document.getElementsByClassName('ukraine_map')
                        
                    if (ukraine_map.length == 1) {
                        var svg = d3.select(".container-1 #graph svg")
                        d3.select(".container-1 .ukraine_map").selectAll("path")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 10 })
                            .attr("fill", "#f5f5f5")
                            .attr("stroke", "#9e9e9e")
                    } else {
                        d3.select(".container-1 #graph svg").html('')
                        var svg = d3.select(".container-1 #graph svg")
                        var g = svg.append("g").attr('class','ukraine_map');

                        drawMap(g,projection)

                        var radiusSize = getRadius(width,2)
                        
                        drawCircles(projection,radiusSize,2)
                    }
                    
                    const zoom = d3.zoom()
                        .on('zoom', zoomed);

                    function zoomed() {
                        
                        var svg = d3.select(".container-1 #graph svg")
                        svg.attr('height',600)
                        if (window.innerWidth>450) {
                            d3.select(".container-1 #graph").style('top','0px')
                        } else {
                            d3.select(".container-1 #graph").style('top','10px')
                        }
                        
                        var g = svg.select(".ukraine_map");
                        g.attr('id','noclass')
                        g.selectAll('path')
                            .attr('transform', d3.event.transform);
                        
                        var cities_mer = svg.select(".cities_mer");
                        cities_mer.selectAll(".container-1 circle")
                            .attr('transform', d3.event.transform);

                        var values = export_json.map(d => d.per1000)

                        var color = d3.scaleThreshold()
                            .domain(makeDomain(0,d3.max(values),.4))
                            .range(["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"]);
                        
                        var radiusSize = getRadius(width,2)
                            
                        cities_mer.selectAll(".container-1 circle")
                            .transition().duration(100)
                            .delay(function(d,i){ return i * 2 })
                            .attr("r",function(d) { return radiusSize(d.per1000) })
                            .attr("stroke-width", ".4px")
                            .attr("stroke", function(d){ 
                                if (d.per1000 > 2) {
                                    return color(d.per1000+1)
                                } else {
                                    return 'none'
                                }
                            })
                            .attr("fill", function(d){ 
                                if (d.per1000 > 2) {
                                    return color(d.per1000)
                                } else {
                                    return 'none'
                                }
                            })
                    }

                    mapZooming(2,zoom)
                    
                } else if (realIndex == 3) {

                    var svg = d3.select(".container-1 #graph svg")
                    var cities_mer = svg.select(".cities_mer");
                    cities_mer.selectAll(".container-1 circle")
                        .on("mouseover", function(d) {
                            tooltipBee.style("visibility", "hidden")
                        })
                        .on("mousemove", function() {
                            tooltipBee.style("visibility", "hidden")
                        })
                        .on("mouseout", function(d){
                            tooltipBee.style("visibility", "hidden");
                        });
                    var ukraine_map = document.getElementsByClassName('ukraine_map')
                    if (ukraine_map.length == 1) {
                        var svg = d3.select(".container-1 #graph svg")
                        d3.selectAll(".title").html('')
                        d3.select(".container-1 .ukraine_map").selectAll("path")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 10 })
                            .attr("fill", "none")
                            .attr("stroke", "none")
                        
                        var cities_mer = svg.select(".cities_mer");
                        cities_mer.selectAll(".container-1 circle")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 1 })
                            .attr('r',0)
                            .attr('fill','none')
                            .attr('stroke','none')
                    } 
                    drawBarChart(width)
                    d3.selectAll("#graph").style('top','30px')
                    d3.selectAll(".death_reason").attr('opacity',1)
                    d3.selectAll(".bar_title").text('Причины смертей в Украине в 2020');
                    
                } else if (realIndex == 4) {
                    var svg = d3.select(".container-1 #graph svg")
                    svg.attr('height',600)
                    var olimp = document.getElementsByClassName('olimp')
                    if (olimp.length !=0 ) {
                        svg.select(".olimp").html('')
                    }
                    var dots = document.getElementsByClassName('death_dots')
                    if(dots.length != 0) {
                        d3.selectAll('.death_reason').attr('opacity',1)
                        d3.selectAll(".circles_index1")
                            .transition().duration(200)
                            .delay(function(d,i){ return i * 2 })
                            .attr("r", 0)
                        d3.selectAll(".index1 text")
                            .attr('opacity',0)
                        d3.selectAll(".circles_index0")
                            .transition().duration(200)
                            .delay(function(d,i){ return i * 2 })
                            .attr("r", 0)
                        d3.selectAll(".index0 text")
                            .attr('opacity',0)
                        d3.selectAll(".annotations")
                            .attr('opacity',0)
                            
                    }
                    var death_reason = document.getElementsByClassName('death_reason')
                    if(death_reason.length == 0) {
                        drawBarChart(width)
                    }
                    d3.selectAll('.death_reason').attr('opacity',1)
                    updateBarChart(window.innerWidth,winterData)
                    d3.selectAll("#graph").style('top','30px')
                    d3.selectAll(".bar_title").attr('opacity',1).text('Причины смертей в Украине в 2021');
                    
                } else if (realIndex == 5) {
                    var svg = d3.select(".container-1 #graph svg")
                    d3.selectAll(".bar_title").attr('opacity',0)
                    d3.selectAll(".subtitle").attr('opacity',0)
                    var dots = document.getElementsByClassName('death_reason')
                    if(dots.length != 0) {
                        d3.selectAll('.death_reason').transition().duration(1000).attr('opacity',0)
                    }
                    if (window.innerWidth < 900) {
                        d3.selectAll("#graph").style('top','40px')
                    } else {
                        d3.selectAll("#graph").style('top','10px')
                    }
                    var dots = document.getElementsByClassName('circles_index1')
                    if(dots.length == 0) {
                        drawDots(width,0)
                        drawDots(width,1)
                    } else {
                        d3.selectAll(".circles_index0")
                            .transition().duration(200)
                            .delay(function(d,i){ return i * 2 })
                            .attr("r", 4)
                        d3.selectAll(".index0 text")
                            .attr('opacity',1)
                        d3.selectAll(".circles_index1")
                            .transition().duration(200)
                            .delay(function(d,i){ return i * 2 })
                            .attr("r", 4)
                        d3.selectAll(".index1 text")
                            .attr('opacity',1)   
                        d3.selectAll(".annotations")
                            .attr('opacity',1)
                    }
                    
                    d3.selectAll(".circles_index2")
                        .transition().duration(200)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r", 0)
                    d3.selectAll(".index2 text")
                        .attr('opacity',0)
                } else if (realIndex == 6) {
                    var svg = d3.select(".container-1 #graph svg")
                    /* if (window.innerWidth < 900) {
                        d3.selectAll("#graph").style('top','40px')
                    } else {
                        d3.selectAll("#graph").style('top','10px')
                    } */
                    d3.selectAll("#graph").style('top','10px')
                    var dots = document.getElementsByClassName('circles_index1')
                    if(dots.length == 0) {
                        drawDots(width,0)
                        drawDots(width,1)
                    } 
                    var dots = document.getElementsByClassName('circles_index2')
                    if(dots.length == 0) {
                        drawDots(width,2)
                    } else {
                        d3.selectAll(".circles_index2")
                        .transition().duration(200)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r", 4)
                        d3.selectAll(".index2 text")
                        .attr('opacity',1)
                    }
                    d3.selectAll(".circles_index3")
                        .transition().duration(200)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r", 0)
                    d3.selectAll(".index3 text")
                        .attr('opacity',0)
                } else if (realIndex == 7) {
                    var svg = d3.select(".container-1 #graph svg")
                    /* if (window.innerWidth < 900) {
                        d3.selectAll("#graph").style('top','40px')
                    } else {
                        d3.selectAll("#graph").style('top','10px')
                    } */
                    d3.selectAll("#graph").style('top','10px')
                    var dots = document.getElementsByClassName('circles_index1')
                    if(dots.length == 0) {
                        drawDots(width,0)
                        drawDots(width,1)
                        drawDots(width,2)
                    } 
                    var dots = document.getElementsByClassName('circles_index3')
                    if(dots.length == 0) {
                        drawDots(width,3)
                    } else {
                        d3.selectAll(".circles_index3")
                        .transition().duration(200)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r", 4)
                        d3.selectAll(".index3 text")
                        .attr('opacity',1)
                    }
                    d3.selectAll(".circles_index4")
                        .transition().duration(200)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r", 0)
                    d3.selectAll(".index4 text")
                        .attr('opacity',0)
                } else if (realIndex == 8) {
                    var svg = d3.select(".container-1 #graph svg")
                    /* if (window.innerWidth < 900) {
                        d3.selectAll("#graph").style('top','40px')
                    } else {
                        d3.selectAll("#graph").style('top','10px')
                    } */
                    d3.selectAll("#graph").style('top','10px')
                    var cities_mer = svg.select(".cities_mer");
                    cities_mer.selectAll(".container-1 circle")
                        .on("mouseover", function(d) {
                            tooltipBee.style("visibility", "hidden")
                        })
                        .on("mousemove", function() {
                            tooltipBee.style("visibility", "hidden")
                        })
                        .on("mouseout", function(d){
                            tooltipBee.style("visibility", "hidden");
                        });
                    var ukraine_map = document.getElementsByClassName('ukraine_map')
                    if (ukraine_map.length == 1) {
                        var svg = d3.select(".container-1 #graph svg")
                        d3.selectAll(".title").html('')
                        d3.select(".container-1 .ukraine_map").selectAll("path")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 10 })
                            .attr("fill", "none")
                            .attr("stroke", "none")
                        
                        var cities_mer = svg.select(".cities_mer");
                        cities_mer.selectAll(".container-1 circle")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 1 })
                            .attr('r',0)
                            .attr('fill','none')
                            .attr('stroke','none')
                    } 
                    
                    if (ukraine_map.length == 1) {
                        svg.select('.olimp').html('');
                        /* if (window.innerWidth < 900) {
                            d3.selectAll("#graph").style('top','40px')
                        } else {
                            d3.selectAll("#graph").style('top','10px')
                        } */
                        //d3.selectAll("#graph").style('top','10px')
                        drawDots(width,0)
                        drawDots(width,1)
                        drawDots(width,2)
                        drawDots(width,3)
                    }
                    /* if (window.innerWidth < 900) {
                        d3.selectAll("#graph").style('top','40px')
                    } else {
                        d3.selectAll("#graph").style('top','10px')
                    } */
                    d3.selectAll("#graph").style('top','10px')
                    var dots = document.getElementsByClassName('circles_index1')
                    if(dots.length == 0) {
                        drawDots(width,0)
                        drawDots(width,1)
                        drawDots(width,2)
                        drawDots(width,3)
                    } 
                    var dots = document.getElementsByClassName('circles_index4')
                    if(dots.length == 0) {
                        drawDots(width,4)
                    } else {
                        d3.selectAll(".death_dots circle")
                        .transition().duration(200)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r", 4)
                        d3.selectAll(".death_dots text")
                        .attr('opacity',1)
                    }
                    d3.selectAll(".death_dots")
                        .attr('opacity',1)
                } else if (realIndex == 9){
                    var svg = d3.select(".container-1 #graph svg")
                    svg.attr('height',500)
                    var death_dots = document.getElementsByClassName('death_dots')
                    if (death_dots.length != 0 ) {
                        /* d3.selectAll(".death_dots circle")
                        .attr("r", 0) */
                        d3.selectAll(".death_dots")
                            .attr('opacity',0)
                        
                        d3.selectAll(".death_dots text")
                        .attr('opacity',0)
                    }
                    var olimp = document.getElementsByClassName('olimp')
                    if (olimp.length != 0 ) {
                        svg.select('.olimp').html('');
                    }
                    var projection = getProjection(width,height)
                        
                    var ukraine_map = document.getElementsByClassName('ukraine_map')
                    
                    if (ukraine_map.length == 1) {
                        var svg = d3.select(".container-1 #graph svg")
                        d3.select(".container-1 .ukraine_map").selectAll("path")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 10 })
                            .attr("fill", "#f5f5f5")
                            .attr("stroke", "#9e9e9e")
                        
                    } else {
                        d3.select(".container-1 #graph svg").html('')
                        var svg = d3.select(".container-1 #graph svg")
                        var g = svg.append("g").attr('class','ukraine_map');
                        drawMap(g,projection)
                    }
                    var radiusSize = getRadius(width,3)
                    
                    var cities_mer_circles = document.getElementsByClassName('cities_mer')
                    if (cities_mer_circles.length == 0) {
                        drawCircles(projection,radiusSize,3)  
                    }
                    
                    var cities_mer = svg.select(".cities_mer");
                    cities_mer.selectAll(".container-1 circle")
                        .transition().duration(100)
                        .delay(function(d,i){ return i * 2 })
                        .attr("r",function(d) {return radiusSize(d.pop) })
                        .attr("cx", function(d){ 
                                return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0] 
                            })
                        .attr("cy", function(d){ return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1] })
                        .attr("stroke", function(d){ 
                            if (d.pop <= 50000) {
                                return '#00838f'
                            } else {
                                return '#616161'
                            }
                        })
                        .attr("fill", function(d){ 
                            if (d.pop <= 50000) {
                                return '#4dd0e1'
                            } else {
                                return '#bdbdbd'
                            }
                        })
                    cities_mer.selectAll(".container-1 circle")
                        .on("mouseover", function(d) {
                            tooltipBee.html(
                                '<h4>'+d.id.split('_')[0]+', '+d.id.split('_')[1]+'</h4>'+
                                '<p>'+numberWithSpaces(d.pop)+' жителей</p>'+
                                '<p>'+numberWithSpaces(d.deaths)+' погибших</p>'+
                                '<p>'+numberWithSpaces(d.per1000)+' погибших на 1000 жителей</p>'
                                )
                            tooltipBee.style("visibility", "visible")
                        })
                        .on("mousemove", function() {
                            return tooltipBee.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
                        })
                        .on("mouseout", function(d){
                            return tooltipBee.style("visibility", "hidden");
                        });
                      
                    
                    var radiusSize = getRadius(width,3)
                        
                    const zoom = d3.zoom()
                        .on('zoom', zoomed);

                    function zoomed() {
                        
                        var svg = d3.select(".container-1 #graph svg")
                        d3.select(".container-1 #graph").style('top','100px')
                        var g = svg.select(".ukraine_map");
                        g.selectAll('path')
                            .attr('transform', d3.event.transform);
                        
                        var cities_mer = svg.select(".cities_mer");
                        cities_mer.selectAll(".container-1 circle")
                            .attr('transform', d3.event.transform);

                    }
                    
                    mapZooming(3,zoom)
                    d3.selectAll("#head_title").attr('opacity',1).text('Города с населением меньше 50 000 человек');
                    
                } else if (realIndex == 10 || realIndex == 11) {
                    /* var svg = d3.select(".container-1 #graph svg")
                    svg.attr('height',500)
                    var dots = document.getElementsByClassName('death_dots')
                    if(dots.length != 0) {
                        d3.selectAll('.death_dots').html('')
                    } */
                    var svg = d3.select(".container-1 #graph svg")
                    var cities_mer = svg.select(".cities_mer");
                    cities_mer.selectAll(".container-1 circle")
                        .on("mouseover", function(d) {
                            tooltipBee.style("visibility", "hidden")
                        })
                        .on("mousemove", function() {
                            tooltipBee.style("visibility", "hidden")
                        })
                        .on("mouseout", function(d){
                            tooltipBee.style("visibility", "hidden");
                        });
                    var ukraine_map = document.getElementsByClassName('ukraine_map')
                    if (ukraine_map.length == 1) {
                        var svg = d3.select(".container-1 #graph svg")
                        d3.selectAll(".title").html('')
                        d3.select(".container-1 .ukraine_map").selectAll("path")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 10 })
                            .attr("fill", "none")
                            .attr("stroke", "none")
                        
                        var cities_mer = svg.select(".cities_mer");
                        cities_mer.selectAll(".container-1 circle")
                            .transition().duration(250)
                            .delay(function(d,i){ return i * 1 })
                            .attr('r',0)
                            .attr('fill','none')
                            .attr('stroke','none')
                    } 
                    var trains = document.getElementsByClassName('train_g')
                    if(trains.length != 0) {
                        d3.selectAll('.train_g').html('')
                    }
                    var position = makeDomain(0,75,.13)
                    var innerCircleRadius = 40;
                    var outerCircleRadius = 60;
                    var olimp = document.getElementsByClassName('olimp')
                    if (olimp.length == 0) {
                        var group = svg.append("g").attr('class','olimp');
                    } else{
                        var group = svg.select('.olimp');
                    }
                    var originX = width/2;
                    
                    if (width < 400) {var originY = 160;var x1 = width/2 } else {var originY = 260;var x1 = width/2.2}
                    var minus = 0
                    var colorIndex = 0
                    
                    for (minus=1;minus<13;minus++) { 
                        position.forEach(function(d){
                            colorIndex+=1
                            var chairOriginX = originX + ((x1-(minus*10)) * Math.sin(d));
                            var chairOriginY = originY - ((x1-(minus*10)-25) * Math.cos(d));
                            if (realIndex == 11 && colorIndex < 4945) {var color = '#b71c1c'} else {var color = "#bdbdbd"}
                        group.append("circle")
                            .attr('cx',chairOriginX)
                            .attr('cy',chairOriginY)
                            .attr('class', 'stadium '+'stadium_row'+String(minus))
                            .attr('fill',color)
                            .style("opacity", 0)
                            .attr('r', 3)
                        })
                    }
                    if (realIndex == 10 || realIndex == 11) {
                        for (minus=1;minus<13;minus++) { 
                            d3.selectAll('.stadium_row'+String(minus))
                                .transition()
                                .delay(function(d,i){ return i *2 })
                                .duration(500)
                                .style("opacity", 1);
                        }
                    }
                } else if (realIndex >= 11) {
                    function drawTrain() {
                        var dataset = [-480,-360,-240,-120,0];
                        var svg = d3.select(".container-1 #graph svg")
                        var g = svg.append('g').attr('id','train_g')
                            
                        var scale = 0.195
                        d3.xml("https://cdn.jsdelivr.net/gh/liga-net/few-projects/50deaths/ukr%20subway.svg", function(xml) {  
                            var importedNode = document.importNode(xml.documentElement, true);
                            
                            g.selectAll("g")
                                .data(dataset)
                                .enter()
                                .append("g")
                                .attr('class','trains')
                                .attr("transform", function(d, i){ 
                                    return "translate(" + d + "," + 50   + ")"+"scale("+ scale +")";
                                })
                                .each(function(d, i){ 
                                    var plane = this.appendChild(importedNode.cloneNode(true)); 
                                    d3.select(plane).select("path").attr("fill", "blue");
                                })
                            d3.selectAll('.trains')
                                .transition()
                                .duration(1)
                                .attr("transform", function(d, i){ 
                                    return "translate(" + -200 + "," + 50   + ")"+"scale("+ scale +")";
                                })
                                .transition()
                                .duration(1000)
                                .attr("transform", function(d, i){ 
                                    return "translate(" + (i * (600 / dataset.length)) + "," + 50   + ")"+"scale("+ scale +")";
                                })
                            
                        });
                        
                    }
                    function animateTrain(timesValue) {
                        var dataset = [-480,-360,-240,-120,0];

                        var h = 200;
                        var svg = d3.select(".container-1 #graph svg")
                        var trains = document.getElementsByClassName('train_g')
                        if(trains.length == 0) {
                            var g = svg.append('g').attr('class','train_g')
                        } else{
                            var g = svg.select('.train_g')
                        }
                        d3.selectAll('.container-1 #graph svg .train_g')
                            .append('text')
                            .attr('id','graph_text')
                            .style('text-align','center')
                            .attr('x',50)
                            .attr('y','20')
                        
                        var scale = 0.195
                        d3.xml("https://cdn.jsdelivr.net/gh/liga-net/few-projects/50deaths/ukr%20subway.svg", function(xml) {  
                            var importedNode = document.importNode(xml.documentElement, true);
                            g.selectAll("g")
                                .data(dataset)
                                .enter()
                                .append("g")
                                .attr('class','trains')
                                .attr("transform", function(d, i){ 
                                    return "translate(" + -800 + "," + 50   + ")"+"scale("+ scale+")";
                                })
                                .each(function(d, i){ 
                                    var plane = this.appendChild(importedNode.cloneNode(true)); 
                                    d3.select(plane).select("path").attr("fill", "blue");
                                })
                            repeat()      
                        });
                        
                        function repeat(){
                            if (timesValue*330 < 50000) {
                                d3.selectAll('.trains')
                                    .transition()
                                    .duration(1)
                                    .attr("transform", function(d, i){ 
                                        return "translate(" + -800 + "," + 50   + ")"+"scale("+ scale +")";
                                    })
                                    .transition()
                                    .duration(2000)
                                    .attr("transform", function(d, i){ 
                                        return "translate(" + (i * (width / dataset.length)) + "," + 50   + ")"+"scale("+ scale +")";
                                    })
                                    .transition()
                                    .duration(800)
                                    .attr("transform", function(d, i){ 
                                        return "translate(" + (i * (width / dataset.length)+1000) + "," + 50   + ")"+"scale("+ scale +")";
                                    })
                                    .transition()
                                    .duration(1)
                                    .on("end", repeat)
                                timesValue += 1
                                if (timesValue != 0 && timesValue != -1) {
                                    d3.select('#graph_text').text(numberWithSpaces(timesValue*330)+' человек проехали в вагонах')
                                }   
                            } else {
                                d3.selectAll('.trains')
                                    .transition()
                                    .duration(1)
                                    .attr("transform", function(d, i){ 
                                        return "translate(" + -800 + "," + 50   + ")"+"scale("+ scale +")";
                                    })
                                    .transition()
                                    .duration(2000)
                                    .attr("transform", function(d, i){ 
                                        return "translate(" + (i * (width / dataset.length)) + "," + 50   + ")"+"scale("+ scale +")";
                                    })
                            }
                            
                        }
                    }
                    var olimp = document.getElementsByClassName('olimp')
                    var svg = d3.select(".container-1 #graph svg")
                    svg.attr('height',500)
                    if (olimp.length != 0) {
                        svg.select(".olimp").html('')
                    }
                    if (timesValue == null) { var timesValue = -1}
                    animateTrain(timesValue)
                } 
                    
            })

    d3.select('#source')
        .styles({'margin-bottom': window.innerHeight - 450 + 'px', padding: '100px'})
    }

    render()
    d3.select(window).on('resize', render)