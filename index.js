let region = "rf";
let userId = "";
let env = "dev";
let tripsRegionCount = 0;
let tripsUserCompleted = 0;
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
let tripCountObj = {};
let statsObj = {};
let lang = "en";
var dev_width;
//Languages
let rules = "";
let updated = "";
let expresscarpool = "";
let tripscompletedTxt = "";
let tripsRemainingTxt = "";
let regionRulesTxt = "";

console.log(firstDay)
console.log(lastDay)


window.onload = function() {
    try {
      var url_string = (window.location.href).toLowerCase();
      var url = new URL(url_string);
      region = url.searchParams.get("region");
      userId = url.searchParams.get("user_id");
      env = url.searchParams.get("env");
      lang = url.searchParams.get("lang");
      dev_width = url.searchParams.get("disp_width");

      if(lang == null){ lang = "en"; }
      translate(lang);
      if(userId != null && region){
        getTripCount(firstDay, lastDay, region, userId);
        //getRegionStatistics(region);
        //getRegionTripCount(region);  
    }
      console.log(region+ " and "+userId);
      console.log(`width: ${dev_width}`);
      document.getElementById('container').style.maxWidth = dev_width+"px";
      document.getElementById('container').style.margin = "auto";
      document.getElementById('container').style.marginTop = "20px";
      //var element = document.getElementById("donutdiv");
      //element.style.backgroundColor='#006400';
    } catch (err) {
      console.log("Issues with Parsing URL Parameter's - " + err);
    }
}

let numOfTrips = 0;
let maxTripsPerday = 0;
let reward = "";

function drawChart(tripsCount){
  document.getElementById("rules").innerHTML = rules;
  document.getElementById("updated").innerHTML = updated;
  if(region != "fle"){
    document.getElementById("expresscarpool").innerHTML = expresscarpool;
  }else{
    document.getElementById("expresscarpool").innerHTML = "";
  }
  
  document.getElementById("mtc").style.display = "none";
    tripsCompleted = tripCountObj.total_count;
    console.log(`tripsCount : ${tripsCount}`);
    console.log(`tripsCompleted : ${tripsCompleted}`);

    if(tripsCompleted > tripsCount){ tripsCount = tripsCompleted; }

    var colors = ['#28a745','#90ee90','#333333','#c3e6cb','#dc3545','#6c757d'];
    var tripsRemaining = tripsCount - tripsCompleted;
    console.log(`tripsRemaining: ${tripsRemaining}`);
    var donutOptions = {
      aspectRatio: 1.5,
      cutoutPercentage: 7, 
      plugins: {
        legend: {
            display: true,
            position: 'bottom'
        }
    },
    events: []
    };
    
    var chDonutData1 = {
        labels: [tripsCompleted + ' ' +tripscompletedTxt, tripsRemaining + ' ' + tripsRemainingTxt],
        datasets: [
          {
            backgroundColor: colors.slice(0,3),
            borderWidth: 2,
            data: [tripsCompleted,tripsRemaining],
            datalabels: {
              color: 'black',
              anchor: 'center',
              align: 'center'
            }
          }
        ]
    };
    
    var chDonut1 = document.getElementById("chDonut1");
    if (chDonut1) {
      new Chart(chDonut1, {
          type: 'doughnut',
          data: chDonutData1,
          plugins: [ChartDataLabels],
          options: donutOptions
      });
    }
}

function getTripCount(start_time, end_time, region, userId){
    const url = 'https://y3kjjhpgu3.execute-api.us-east-1.amazonaws.com/prod/dashboard/regions/get_trip_count';
    var bodyMap = JSON.stringify({ "env": env , "end_time": end_time, "region": region, "user_id": userId})
    //console.log(bodyMap);
    var h = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: bodyMap,
      method: "POST"
    }
  
    fetch(url, h).then(response => response.json()).then(data => {
      let tripCount = data.Payload;
      tripCountObj = tripCount;
      console.log(tripCount);
      tripsUserCompleted = tripCount.total_count;
      console.log(`tripsUserCompleted: ${tripsUserCompleted}`);
      getRegionStatistics(region);
      //drawChart(tripsRegionCount);
    });
  }

  function getRegionStatistics(region){
    const url = 'https://y3kjjhpgu3.execute-api.us-east-1.amazonaws.com/prod/dashboard/regions/get_region_statistics';
    var bodyMap = JSON.stringify({"region": region})
    //console.log(bodyMap);
    var h = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: bodyMap,
      method: "POST"
    }
  
    fetch(url, h).then(response => response.json()).then(data => {
      let regionStats = data.Payload;
      statsObj = regionStats;
      console.log(`${JSON.stringify(statsObj)}`);
      regionRulesTxt = statsObj.rules;

      if(lang == "en") { }
      else if(lang == "fr") { regionRulesTxt = statsObj.rulesFr; }
      else if (lang == "es") { regionRulesTxt = statsObj.rulesSp; }
      else { regionRulesTxt = statsObj.rules; }

      document.getElementById('rewardPicture').src = statsObj.reward_image;
      if(region == "fle"){
        let fleRules = regionRulesTxt;
        const myArray = fleRules.split(".");
        let rule1 = myArray[0];
        let rule2 = myArray[1];
        let rule3 = myArray[2];
        let rule4 = myArray[3];
        let rule2b = rule2.bold();
        document.getElementById('rulesOffer').innerHTML = rule1 + "<br>" + rule2b + "<br><br>" + rule3 + "<br>" + rule4;
      }else{
        document.getElementById('rulesOffer').innerHTML = regionRulesTxt;
      }
      
      tripsRegionCount = statsObj.tripsCount;
      drawChart(tripsRegionCount);
    });
  }

function getRegionTripCount(region){
    if(region == 'ut' || region == 'fl' || region == 'rf'){
        //20 trips per month
        tripsRegionCount = 20;
    }else{
        //default at the moment for other regions
        tripsRegionCount = 10;
    }
}


function translate(lang){
  if(lang == "en"){
     rules = "Rules";
     if(region == "fle"){
      updated = "Updated July 5th, 2022";
     }else{
      updated = "Updated November 19th, 2021";
     }
     expresscarpool = "Express Carpool Check";
     tripscompletedTxt = "Trips Completed";
     tripsRemainingTxt = "Trips Remaining";

  }else if(lang == "fr"){
     rules = "Règles";
     if(region == "fle"){
      updated = "Mis à jour le 5 juillet 2022";
     }else{
      updated = "Mis à jour le 19 novembre 2021";
     }
     expresscarpool = "Vérification de covoiturage express";
     tripscompletedTxt = "Voyages terminés";
     tripsRemainingTxt = "Voyages restants";
  }else if(lang == "es"){
    rules = "Normas";
    if(region == "fle"){
      updated = "Actualizado el 5 de julio de 2022";
     }else{
      updated = "Actualizado el 19 de noviembre de 2021";
     }
    expresscarpool = "Cheque de viaje compartido exprés";
    tripscompletedTxt = "Viajes completados";
    tripsRemainingTxt = "Viajes restantes";
  }else{
    rules = "Rules";
    if(region == "fle"){
      updated = "Updated July 5th, 2022";
     }else{
      updated = "Updated November 19th, 2021";
     }
    expresscarpool = "Express Carpool Check";
    tripscompletedTxt = "Trips Completed";
    tripsRemainingTxt = "Trips Remaining";
  }

}