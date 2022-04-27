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
console.log(firstDay)
console.log(lastDay)

window.onload = function() {
    try {
      var url_string = (window.location.href).toLowerCase();
      var url = new URL(url_string);
      region = url.searchParams.get("region");
      userId = url.searchParams.get("user_id");
      env = url.searchParams.get("env");
      if(userId != null && region){
        getTripCount(firstDay, lastDay, region, userId);
        //getRegionStatistics(region);
        //getRegionTripCount(region);  
    }
      console.log(region+ " and "+userId);
    } catch (err) {
      console.log("Issues with Parsing URL Parameter's - " + err);
    }
}

let numOfTrips = 0;
let maxTripsPerday = 0;
let reward = "";

function drawChart(tripsCount){
  document.getElementById("rules").innerHTML = "Rules";
  document.getElementById("updated").innerHTML = "Updated November 19th, 2021";
  document.getElementById("expresscarpool").innerHTML = "Express Carpool Check";
  document.getElementById("mtc").style.display = "none";
    tripsCompleted = tripCountObj.total_count;
    console.log(`tripsCount : ${tripsCount}`);
    console.log(`tripsCompleted : ${tripsCompleted}`);

    var colors = ['#28a745','#808080','#333333','#c3e6cb','#dc3545','#6c757d'];
    var tripsRemaining = tripsCount - tripsCompleted;
    console.log(`tripsRemaining: ${tripsRemaining}`);
    var donutOptions = {
      aspectRatio: 1.5,
      cutoutPercentage: 7, 
      plugins: {
        legend: {
            display: false
        }
    }
    };
    
    var chDonutData1 = {
        labels: ['Trips Completed', 'Trips Remaining'],
        datasets: [
          {
            backgroundColor: colors.slice(0,3),
            borderWidth: 2,
            data: [tripsCompleted,tripsRemaining],
            datalabels: {
              color: 'black',
              anchor: 'end',
              align: 'top'
            }
          }
        ]
    };
    
    var chDonut1 = document.getElementById("chDonut1");
    if (chDonut1) {
      new Chart(chDonut1, {
          type: 'bar',
          data: chDonutData1,
          plugins: [ChartDataLabels],
          options: donutOptions
      });
    }
}

function getTripCount(start_time, end_time, region, userId){
    const url = 'https://y3kjjhpgu3.execute-api.us-east-1.amazonaws.com/prod/dashboard/regions/get_trip_count';
    var bodyMap = JSON.stringify({ "env": "dev" , "start_time": start_time, "end_time": end_time, "region": region, "user_id": userId})
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
      document.getElementById('rewardPicture').src = statsObj.reward_image;
      document.getElementById('rulesOffer').innerHTML = statsObj.rules;
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
