$(function(){
    map.initialize("./text.json","./js/map/");//地图初始化(配置json文件的路径)
});

var map=new Object();

//mapUrl--地图json文件的路径
//contentUrl--数据内容的路径
map.initialize = function(contentUrl,mapUrl){
    $.ajax({
        url:contentUrl,
        type:'GET',
        dataType:'json',
        success:function(map){
            var content = map.content;//获取各城市具体信息
            var pChina = map.pChina;//获取各省份中文名字
            var eChina = map.eChina;//获取各省份名字拼音
            var geoCoordMap = map.geoCoordMap;//获取各城市的经纬度
//            console.log(content);
//            console.log(pChina);
//            console.log(eChina);
//            console.log(geoCoordMap);
            
            var convertData = function(data){
                var Res = [];
                for (var i=0;i<data.length;i++) {
                    var geoCoord = geoCoordMap[data[i].name];
                    if (geoCoord) {
                        Res.push({
                            name: data[i].name,
                            angle:geoCoord.concat(data[i].angle),
                            time:geoCoord.concat(data[i].time),
                            value: geoCoord.concat(data[i].value),
                            price:geoCoord.concat(data[i].time),
                            subsidy:geoCoord.concat(data[i].subsidy),
                        });
                    }
                }
                return Res;
            };//将获取到的经纬度和具体信息相结合，方便后期地图展示的处理
            
            var mainChart = echarts.init(document.getElementById('main'));
            var eachChart = echarts.init(document.getElementById('each'));
            
            $.get(mapUrl+'china.json', function (chinaJson) {
                echarts.registerMap('china',chinaJson);
                
                var option = function(title,name){
                    return {
                        backgroundColor: '#404a59',
                        title: {
                            text:title,
                            subtext: '纯属虚构',
                            x: 'center',
                            textStyle : {
                                color: '#fff'
                            }
                        },//设置地图表头（图标标题，副标题以及位置）
                        legend: {
                            orient: 'vertical',
                            y: 'bottom',
                            x:'right',
                            data:['具体数据'],
                            textStyle: {
                                color: '#fff'
                            }
                        },//设置右下角关闭气泡按钮
                        tooltip: {
                            trigger: 'item',
                            formatter:function (params){
                                var Tips = '<div>'+params.name +'<br/>最佳安装倾角：' + params.data.angle[2]+'°<br/>峰值日照时数：'+params.data.angle[2]+'h/day<br/>每瓦年发电量：'+params.value[2]+'kWh/W<br/>地方居民电价：'+params.data.price[2]+'元/W<br/>地方建设补贴：'+params.data.subsidy[2]+'</div>';
                                    return Tips;
                            },
                            textStyle:{
                                fontSize:12,
                            }
                        },//设置可以使鼠标移入数据跟随显示
                        itemStyle:{
                            normal:{
                                label:{show:true}
                            },
                            emphasis:{
                                label:{show:true}
                            }
                        },
                        geo: {
                            map: name ,
                            label: {
                                emphasis: {
                                    show: false
                                }
                            },
                            itemStyle: {
                                normal: {
                                    areaColor: '#ccc',
                                    borderColor: '#666'
                                },
                                emphasis: {
                                    areaColor: '#fff'
                                }
                            }                   
                        },
                        visualMap: {
                            min: 1,
                            max: 2,
                            calculable: true,
                            type: 'piecewise', 
                            inRange: {
                                color: ['#50a3ba','#eac736','#d94e5d']
                            },
                            textStyle: {
                                color: '#000'
                            }
                        },
                        series: [
                            {
                                name:'具体数据',
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                label: {
                                    normal: {
                                        show: false
                                    },
                                    emphasis: {
                                        show: false
                                    }
                                },
                                data:convertData(content),
                            }
                        ],
                        symbolSize: 12,
                        label: {
                            normal: {
                                show: false
                            },
                            emphasis: {
                                show: false
                            }
                        },
                        itemStyle: {
                            emphasis: {
                                borderColor: '#fff',
                                borderWidth: 1,
                            }
                        }
                    };
                }
                
                mainChart.setOption(option("发电小时数统计表",'china'));
                
                mainChart.on('click',function(params){
                    var index = pChina.indexOf(params.name);
//                    console.log(index);
                    var mapName = eChina[index];
//                    console.log(mapName);
                    if(mapName){
                        $('#main').css('display','none');
                        $('.eachBox').css('display','block');
                        $.get(mapUrl+mapName+'.json',function(geoJson){
                            echarts.registerMap(mapName,geoJson);
                            eachChart.setOption(option(params.name+"省具体情况",mapName));
                        })
                    }
                })
            });
        }
    })
    
    $('.btn').click(function(){
        $('.eachBox').css('display','none');
        $('#main').css('display','block');
    });
}