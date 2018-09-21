var apiTaleURL = "https://lit-wildwood-83335.herokuapp.com/api/tale/";
var apiRatingURL = "http://localhost:8080/api/tale/rating/";
//http://localhost:8080/api/tale/rating/
//https://lit-wildwood-83335.herokuapp.com/api/tale/rating/
var currentTaleDate;

var getDates = function(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

function showTaleByDate(date){
  var baseURL = window.location.href.split('?')[0];//url without query params
  window.location = baseURL +"?date="+date;
}

function getTaleByURL(url){
  let searchParams = new URLSearchParams(url.search);
  let paramDate = searchParams.get('date');
  if(paramDate)
    getTaleByDate(paramDate);
  else getTaleByDate(formatDateToString(new Date()));//show today's tale
}

function getTaleByDate(date){
  currentTaleDate = date;
  let getURL = apiTaleURL;
  getURL+=date;
  $.ajax({
      url: getURL
  }).then(function(data) {
     $('#tale-title').text(data.title);
     $('#tale-description').text(data.description);
  });
  //show user's Rating
  var rating = getRatingByDate(date);
  appendRating(rating);
}

function getRatingByDate(date){
  var rating = localStorage.getItem("rating"+date);
  if(rating === null)
     rating = 0;
  return Number(rating);
}

function setRatingByDate(date, rating){
  //send data to api
  var ratingData;
  var httpMethod = 'POST';
  var oldRating = getRatingByDate(date);
  //check if it has been rated before or not
  if(oldRating === 0){//not rated
    ratingData = {
      "rating" : rating
    }
    httpMethod = 'POST';
  }
  else{//if rated before, update the previous rating
    ratingData = {
      "rating" : rating,
      "oldRating" : oldRating
    }
    httpMethod = 'PUT';
  }

  $.ajax({
   url: apiRatingURL+date,
   type: httpMethod,
   data : JSON.stringify(ratingData),
   dataType: "json",
   contentType: "application/json",
   success: function(data){
        if(data.returnNumber == -4){//rating does not exist, post it
          //first delete the rating
          localStorage.removeItem("rating"+date);
          //the new function call will send a POST reqesut instead of PUT
          setRatingByDate(date, rating);
        }
    },
   error: function(err) {
      console.log(err);
    }
  });
  //save rating to localstorage
  localStorage.setItem("rating"+date, rating);
}

function appendRating(rating){
  $("#rating").emojiRating({
     initRating : rating,
     fontSize: 32,
     onUpdate: function(count) {
       setRatingByDate(currentTaleDate,count);
     }
   });
}

function formatDateToString(date){
    year = date.getFullYear();
    month = date.getMonth()+1;
    dt = date.getDate();

    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }
    return (year+'-' + month + '-'+dt);
}

function appendItemsToArchiveList(){
  var dates = getDates(new Date(2018,08,17), Date.now());
  var archiveListElem = document.getElementById("archive-list");
  dates.forEach(function(date) {
    var prettyDate = formatDateToString(date);
    var listItem = document.createElement("a");
    listItem.appendChild(document.createTextNode(prettyDate));
    listItem.href = "javascript:showTaleByDate('"+prettyDate+"');";
    listItem.className = "dropdown-item";
    archiveListElem.appendChild(listItem);
  });
}

$(document).ready(function() {
  if(window.location.href.indexOf("top")  > -1){
    //top.html

  }
  else{
    //index.html
      getTaleByURL(window.location);
      appendItemsToArchiveList();
  }
});
