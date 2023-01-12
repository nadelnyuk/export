function makeTree(w) {
    if (w>600) {
        width = 600
    } else {
        var width = w
    }
    height = 1000
    d3.select("#chart").html('')
    var svg = d3.select("#chart").append('svg').attr('width',width).attr('height',1000),
        g = svg.append("g").attr("transform", "translate(20,0)"); 

    // x-scale and x-axis
    var experienceName = ["", "","","","",""];
    var formatSkillPoints = function (d) {
        return experienceName[d % 6];
    }
    var xScale =  d3.scaleLinear()
            .domain([0, 100])
            .range([0, 200]);

    var xAxis = d3.axisTop()
            .scale(xScale)
            .ticks(5)
            .tickFormat(formatSkillPoints);

    
    var tree = d3.cluster()   
    .size([height, width - 250])
    .separation(function separate(a, b) {
        return a.parent == b.parent
        || a.parent.parent == b.parent
        || a.parent == b.parent.parent ? 0.4 : 0.8;
    });

    var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

    var data = [
{"id": "Бенефіціар","value": null},
{"id": "Бенефіціар.Рінат Ахметов","value": 0},
{"id": "Бенефіціар.Рінат Ахметов.ДТЕК Київські електромережі","value": 100},
{"id": "Бенефіціар.Рінат Ахметов.ДТЕК Київські регіональні електромережі","value": 100},
{"id": "Бенефіціар.Рінат Ахметов.ДТЕК Донецькі електромережі","value": 100},
{"id": "Бенефіціар.Рінат Ахметов.ДТЕК Дніпровські електромережі","value": 77},
{"id": "Бенефіціар.Рінат Ахметов.ДТЕК Одеські електромережі","value": 72},
{"id": "Бенефіціар.Рінат Ахметов.Хмельницькобленерго","value": 7},
{"id": "Бенефіціар.Рінат Ахметов.Кіровоградобленерго","value": 24.5},
{"id": "Бенефіціар.Міністерство енергетики України","value": 0},
{"id": "Бенефіціар.Міністерство енергетики України.Хмельницькобленерго","value": 70},
{"id": "Бенефіціар.Міністерство енергетики України.ДТЕК Одеські електромережі","value": 25},
{"id": "Бенефіціар.Міністерство енергетики України.Черкасиобленерго","value": 46},
{"id": "Бенефіціар.Міністерство енергетики України.Миколаївобленерго","value": 70},
{"id": "Бенефіціар.Міністерство енергетики України.Харківобленерго","value": 65},
{"id": "Бенефіціар.Міністерство енергетики України.Запоріжжяобленерго","value": 60},
{"id": "Бенефіціар.Міністерство енергетики України.Тернопільобленерго","value": 25},
{"id": "Бенефіціар.Міністерство енергетики України.Сумиобленерго","value": 25},
{"id": "Бенефіціар.VS Energy","value": 0},
{"id": "Бенефіціар.VS Energy.Кіровоградобленерго","value": 73},
{"id": "Бенефіціар.VS Energy.Рівнеобленерго","value": 93},
{"id": "Бенефіціар.VS Energy.Житомиробленерго","value": 95},
{"id": "Бенефіціар.VS Energy.Херсонобленерго","value": 100},
{"id": "Бенефіціар.VS Energy.Миколаївобленерго","value": 9},
{"id": "Бенефіціар.VS Energy.Чернівціобленерго","value": 100},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов","value": 0},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов.Тернопільобленерго","value": 40},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов.ДТЕК Дніпровські електромережі","value": 16},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов.Запоріжжяобленерго","value": 12.3},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов.Сумиобленерго","value": 68},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов.Чернігівобленерго","value": 83},
{"id": "Бенефіціар.Коломойський; Григоришин і Боголюбов.Полтаваобленерго","value": 82},
{"id": "Бенефіціар.Ігор Коломойський","value": 0},
{"id": "Бенефіціар.Ігор Коломойський.Львівобленерго","value": 5},
{"id": "Бенефіціар.Костянтин Григоришин","value": 0},
{"id": "Бенефіціар.Костянтин Григоришин.Черкасиобленерго","value": 24},
{"id": "Бенефіціар.Костянтин Григоришин.Луганське енергетичне об'єднання","value": 100},
{"id": "Бенефіціар.Костянтин Григоришин.Вінницяобленерго","value": 72},
{"id": "Бенефіціар.Костянтин Григоришин.Чернігівобленерго","value": 9},
{"id": "Бенефіціар.Костянтин Григоришин.Полтаваобленерго","value": 8},
{"id": "Бенефіціар.Костянтин Григоришин.Волиньобленерго","value": 21},
{"id": "Бенефіціар.Оксана Марченко","value": 0},
{"id": "Бенефіціар.Оксана Марченко.Запоріжжяобленерго","value": 23.6},
{"id": "Бенефіціар.Оксана Марченко.Прикарпаттяобленерго","value": 63},
{"id": "Бенефіціар.Оксана Марченко.Львівобленерго","value": 62},
{"id": "Бенефіціар.Ігор і Григорій Суркіси","value": 0},
{"id": "Бенефіціар.Ігор і Григорій Суркіси.Львівобленерго","value": 30},
{"id": "Бенефіціар.Ігор і Григорій Суркіси.Прикарпаттяобленерго","value": 25},
{"id": "Бенефіціар.Фонд державного майна України","value": 0},
{"id": "Бенефіціар.Фонд державного майна України.Черкасиобленерго","value": 25},
{"id": "Бенефіціар.Фонд державного майна України.Тернопільобленерго","value": 26},
{"id": "Бенефіціар.Анатолій Бойко (син Юрія Бойко)","value": 0},
{"id": "Бенефіціар.Анатолій Бойко (син Юрія Бойко).Волиньобленерго","value": 75},
{"id": "Бенефіціар.Юлія Льовочкіна","value": 0},
{"id": "Бенефіціар.Юлія Льовочкіна.Закарпаттяобленерго","value": 100},
{"id": "Бенефіціар.Вадим Новинський","value": 0},
{"id": "Бенефіціар.Вадим Новинський.Харківобленерго","value": 30},
{"id": "Бенефіціар.Макар Пасенюк і Костянтин Стеценко","value": 0},
{"id": "Бенефіціар.Макар Пасенюк і Костянтин Стеценко.Вінницяобленерго","value": 25
}
]
        var root = stratify(data);
        
        tree(root);

        var link = g.selectAll(".link")
                .data(root.descendants().slice(1))
                .enter().append("path")
                .attr("class", "link")
                .attr('fill','none')
                .attr('stroke','#cecece')
                .attr('stroke-opacity','0.9')
                .attr('stroke-width','1px')
                .attr("d", function(d) {
                    return "M" + d.y + "," + d.x
                            + "C" + (d.parent.y + 100) + "," + d.x
                            + " " + (d.parent.y + 100) + "," + d.parent.x
                            + " " + d.parent.y + "," + d.parent.x;
                });

        var node = g.selectAll(".node")
                .data(root.descendants())
                .enter().append("g")
                .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        // Draw every datum a small circle.
        node.append("circle")
        .style('fill','#999')
                .attr("r", 4);

        // Setup G for every leaf datum.
        var leafNodeG = g.selectAll(".node--leaf")
                .append("g")
                .attr("class", "node--leaf-g")
                .attr("transform", "translate(" + 8 + "," + -13 + ")");

        leafNodeG.append("rect")
                .attr("class","shadow")
                .style("fill", '#f44336')
                .attr("width", 2)
                .attr("height", 15)
                .attr("rx", 2)
                .attr("ry", 0)
                .transition()
                    .duration(800)
                    .attr("width", function (d) {return xScale(d.data.value);});

        leafNodeG.append("text")
                .attr("dy", 11.5)
                .style('font-family', 'sans-serif')
                .style('fill', 'black')
                .style('font-weight','bold')
                .style('font-size','9px')
                .attr("x", 8)
                .style("text-anchor", "start")
                .text(function (d) {
                    return d.data.id.substring(d.data.id.lastIndexOf(".") + 1) + ": " + d.data.value +'%';
                });

        // Write down text for every parent datum
        var internalNode = g.selectAll(".node--internal");
        internalNode.append("text")
                .attr("y", -12)
                .style("text-anchor", "middle")
                .style('font-family', 'sans-serif')
                .style('fill', 'black')
                .style('font-weight','bold')
                .style('font-size','12px')
                .html(function (d) {
                    var value = d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
                    if (width < 500) {
                        if (value == 'Міністерство енергетики України') {
                            return "Міненерго"
                        } else if (value == 'Фонд державного майна України') {
                            return 'Фонд держмайна'
                        } else if (value == 'Макар Пасенюк і Костянтин Стеценко') {
                            return 'Пасенюк і Стеценко'
                        } else if (value == 'Анатолій Бойко (син Юрія Бойко)') {
                            return 'Анатолій Бойко'
                        } else if (value == 'VS Energy') {
                            return 'VS Energy'
                        } else if (value == 'Бенефіціар') {
                            return ''
                        } else if (value == 'Коломойський; Григоришин і Боголюбов') {
                            return '<tspan y="-12" x="-9">Коломойський</tspan><tspan y="2" x="-9">Григоришин</tspan><tspan y="16" x="-9">Боголюбов</tspan>'
                        } else {
                            var splited = value.split(' ')
                            return splited[0][0] +'. '+splited[1]
                        }
                    } else {
                        if (value == 'Бенефіціар') {
                            return ''
                        } else {
                            return value
                        }
                        
                    }
                    
                });

        // Attach axis on top of the first leaf datum.
        var firstEndNode = g.select(".node--leaf");

            // tick mark for x-axis
            firstEndNode.insert("g")
                    .attr("class", "grid")
                    .style('stroke-width','0')
                    .attr("transform", "translate(7," + (height - 15) + ")")
                    .call(d3.axisBottom()
                            .scale(xScale)
                            .ticks(5)
                            .tickSize(-height, 0, 0)
                            .tickFormat("")
                    );

        // Emphasize the y-axis baseline.
        svg.selectAll(".grid").select("line")
                .style('stroke','#eeeeee')
                .style('opacity','0.7');

}
makeTree(window.innerWidth)
window.onresize = function(event) {
    makeTree(window.innerWidth)
}