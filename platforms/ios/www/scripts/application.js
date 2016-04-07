document.addEventListener("DOMContentLoaded", init);
var base64ImageData;

function init(ev) {

    obj = document.getElementById("takePic");
    let hammer2 = new Hammer(obj);
    hammer2.on('tap', app.callCamera);
    console.log("button listener added");

    obj = document.getElementById("submit");
    let hammer3 = new Hammer(obj);
    hammer3.on('tap', submitReview);
    console.log("button listener added");

    app.image = document.querySelector("#image");

    //when page is ready add event listeners to every object as needed
    //add listeners to buttons
    var pl = document.querySelectorAll(".page-link");
    [].forEach.call(pl, function (obj, index) {
        let hammer1 = new Hammer(obj);
        hammer1.on('tap', navigate);

    });

    //add listeners to pages
    var pages = document.querySelectorAll("[data-role=page]");
    [].forEach.call(pages, function (obj, index) {
        obj.className = "inactive-page";
        //setting the class in JS will trigger the animation
        if (index == 0) {
            obj.className = "active-page";
        }
        //transitionend or animationend listeners
        obj.addEventListener("animationend", pageAnimated);
    });
}

function navigate(ev) {
    ev.preventDefault();
    var btn = ev.target;
    var href = btn.href;
    var id = href.split("#")[1];
    //history.pushState();
    var pages = document.querySelectorAll('[data-role="page"]');
    for (var p = 0; p < pages.length; p++) {
        //console.log(pages[p].id, page);
        if (pages[p].id === id) {
            pages[p].classList.remove("hidden");
            if (pages[p].className !== "active-page") {
                pages[p].className = "active-page";
            }
            //console.log("active ", page)
        } else {
            if (pages[p].className !== "inactive-page") {
                pages[p].className = "inactive-page";
            }
        }
    }
}

function pageAnimated(ev) {

    var page = ev.target;
    if (page.className == "active-page") {
        console.log(ev.target.id, " has just appeared");
        if (ev.target.id == "allReviews") {
            showAllReviews();
        }
    } else {
        console.log(ev.target.id, " has just disappeared");
    }
}
function showAllReviews() {
    
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var parsedReviewList = JSON.parse(xhttp.responseText);
           // alert(xhttp.responseText);
            displayReviews(parsedReviewList);
        }
    };

    xhttp.open("POST", "https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log(" Show all Review - uuid " + device.uuid);
    var parameters = "uuid=" + device.uuid;
    xhttp.send(parameters);
   
}

function displayReviews(reviewJSON) {
    var out = "";
    var i;
    var reviewsArray = reviewJSON.reviews;

    out += "<table class=table-headers>";
    out += "    <thead>";
    out += "        <tr>";
    out += "            <th>Review ID</th>";
    out += "            <th>Title</th>";
    out += "            <th>Rating</th>";
    out += "        </tr>";
    out += "    </thead>";
    out += "    <tbody>";
    for (i = 0; i < reviewsArray.length; i++) {
        out += "        <tr>";
        out += "            <td data-th='Review ID'>" + '<a href="#" onClick="getReviewDetailsById(' + reviewsArray[i].id + ');">' + reviewsArray[i].id + '</a><br>' + "</td>";
        out += "            <td data-th='Title'>" + '<a href="#" onClick="getReviewDetailsById(' + reviewsArray[i].id + ');">' + reviewsArray[i].title + '</a><br>' + "</td>";
        out += "            <td data-th='Rating'>" + reviewsArray[i].rating + "</td>";
        out += "        </tr>";
    }
    out += "    </tbody>";
    out += "</table>";
    document.getElementById("allReviewsContent").innerHTML = out;
}

function getReviewDetailsById(review_id) {

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var reviewDetailsJSON = JSON.parse(xhttp.responseText);
            displayReviewDetails(reviewDetailsJSON);

        }
    };
    xhttp.open("POST", "https://griffis.edumedia.ca/mad9022/reviewr/review/get/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log(" get Review - uuid " + device.uuid);
    var parameters = "uuid=" + device.uuid;
    parameters += "&review_id=" + review_id;
    xhttp.send(parameters);
}

function displayReviewDetails(reviewDetailsJSON) {
    document.querySelector("#allReviews").className = "inactive-page";
    document.querySelector("#newReview").className = "inactive-page";
    document.querySelector("#details").className = "active-page";

    var out = "";
    var review = reviewDetailsJSON.review_details;

    out += "<table class=table-headers>";
    out += "    <tbody>";
    out += "        <tr>";
    out += "            <th> Review ID </th>";
    out += "            <td>" + review.id + "</td>";
    out += "        </tr>";
    out += "            <th> Title </th>";
    out += "            <td>" + review.title + "</td>";
    out += "        </tr>";
    out += "            <th> Review </th>";
    out += "            <td>" + review.review_txt + "</td>";
    out += "        </tr>";
    out += "        </tr>";
    out += "            <th> Rating </th>";
    out += "            <td>" + review.rating + "</td>";
    out += "        </tr>";
    var imageData = decodeURIComponent(review.img);
    out += "        </tr>";
    out += "            <th> Image </th>";
    out += "            <td>" + '<img style="width:150px;height:150px;" src=' + imageData + ' alt=""  />' + "</td>";
    out += "        </tr>";


    out += "    </tbody>";
    out += "</table>";
    document.getElementById("reviewContent").innerHTML = out;

}


var app = {
    image: null,
    imgOptions: null,

    callCamera: function () {
        app.imgOptions = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth: 200,
            cameraDirection: Camera.Direction.FRONT,
            saveToPhotoAlbum: false
        };

        navigator.camera.getPicture(app.imgSuccess, app.imgFail, app.imgOptions);
    },

    imgSuccess: function (imageData) {
        //got an image back from the camera

        console.log("image data from camera: " + imageData);

        app.image.src = "data:image/jpeg;base64," + imageData;

        console.log("image data from camera as image src: " + app.image.src);

        console.log("Image loaded into interface");

        base64ImageData = encodeURIComponent(app.image.src);

        console.log("image data from camera after encode: " + base64ImageData);

        //clear memory in app
        navigator.camera.cleanup();
    },

    imgFail: function (msg) {
        console.log("Failed to get image: " + msg);
    }

};

function clearForm() {
    document.querySelector("#titleInput").value = "";
    document.querySelector("#reviewInput").value = "";
    document.querySelector("#ratingInput").value = "";
}

function submitReview() {
    var xhttp;

    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            var result = JSON.parse(xhttp.responseText);
            console.log("submit" + xhttp.responseText);
            clearForm();
            getReviewDetailsById(result.review_details.id);
        }
    };
    console.log(" Submit Review - uuid " + device.uuid);
    var parameters = "uuid=" + device.uuid;
    parameters += "&action=insert";
    parameters += "&title=" + document.querySelector("#titleInput").value;
    parameters += "&review_txt=" + document.querySelector("#reviewInput").value;
    parameters += "&rating=" + document.querySelector("#ratingInput").value;
    parameters += "&img=" + base64ImageData;
    xhttp.open("POST", "https://griffis.edumedia.ca/mad9022/reviewr/review/set/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(parameters);
}