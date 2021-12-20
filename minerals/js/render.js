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
    if (w < 400) {
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
function getData(id){
    var value = $.ajax({ 
        url: id, 
        async: false
    }).responseJSON;
    return value;
}

width = getWidth(d3.select('#graph').node().offsetWidth),
height = getHeight(d3.select('#graph').node().offsetWidth)
function getWidth(w) {
    if (w < 1200) {
        return w-10
    } else {
        return 1200
    }
}
function getHeight(w) {
    if (w < 1200) {
        return w/1.3
    } else {
        return 700
    }
}
function getProjection(width,height) {
    if (width < 1200) {var scale = 980} else {var scale = 2500}
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
    if (width < 1200 || id == 2) {var radiusMaxValue = 4} else {var radiusMaxValue = 8}
    if (id == 3) {
        var values = export_json.map(d=>d.pop)
    } else {
        var values = export_json.map(d => d.per1000)
    }
    return d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([3,radiusMaxValue]) 
}
function showColor(value) {
    var list = colorId.filter(d => d.id == value)
    if (list.length > 0) {
        return list[0].col
    }
    
}
function drawCircles(projection,id,tooltipBee) {
    var svg = d3.select(".container-1 #graph svg")
    var cities_mer = svg.append("g").attr('class','cities_mer');
    var path = d3.geoPath()
        .projection(projection);
    if (id == 1) {
        cities_mer.selectAll('path')
            .data(export_json)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class',function(d) {
                return 'field id'+String(d.color)+" d"+String(d.dob)
            })
            .attr('fill',function(d) {return showColor(d.color)})
            .attr('stroke-width',function (d) {
                var square = d3.polygonArea(d.geometry.coordinates[0])
                if (square < 0.03) {
                    return '3'
                } else {
                    return '.5'
                }
            })
            .attr('stroke',function (d) {
                var square = d3.polygonArea(d.geometry.coordinates[0])
                if (square < 0.03) {
                    return showColor(d.color)
                } else {
                    return 'white'
                }
            })
            .on("mouseover", function(d) {
                var item = details.filter(x => x.id == d.id)[0]
                tooltipBee.html(
                    '<h4>'+item.name+'</h4>'+
                    '<p>'+item.reg+' область</p>'+
                    '<p>Бенефіціар: '+item.ben+'</p>'
                    )
                tooltipBee.style("visibility", "visible")
            })
            .on("mousemove", function() {
                return tooltipBee.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(d){
                return tooltipBee.style("visibility", "hidden");
            });
    }
    
}
function mapZooming(id,zoom) {
    if (id == 1) {
        var city = [30.02,50],
            delta_height = 3,
            svgScale = 1
    } else if (id == 2) {
        var city = [32.0755801,48.5186805],
            delta_height = 3,
            svgScale = 2.5
    }
    function transform(x,y,scale) {
        return d3.zoomIdentity
            .translate(width/2.2, height / delta_height)
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
    if (width < 600){
        var cyValue = 58
        svg.attr('height',window.innerHeight-50)
        var heightSVG = 800
        var maxValue = Math.round((100) / 16)
        var cxValues = [15,42,75,109,145]
        var xTextValues = [12,37,66,98,133]
        var radius = 4
    } else {
        var cyValue = 40
        svg.attr('height',650)
        var heightSVG = 1300
        var maxValue = Math.round((100) / 10)
        var cxValues = [25,63,115,168,220]
        var xTextValues = [25,65,110,155,200]
        var radius = 4
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
            .attr("r", radius)
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
            cyValue += 4
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
            .attr("r", radius)
   
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
        svg.attr('height',start_height)
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