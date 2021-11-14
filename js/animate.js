// var $overlay = $('<div id="overlay"></div>');
// var $image = $("<img>");
//
// //An image to overlay
// $overlay.append($image);
//
// //Add overlay
// $("body").append($overlay);
//
// //click the image and a scaled version of the full size image will appear
// $("#wrapper").click(function (event) {
//     event.preventDefault();
//     var imageLocation = $(this).attr("href");
//
//     //update overlay with the image linked in the link
//     $image.attr("src", imageLocation);
//
//     //show the overlay
//     $overlay.show();
// });
//
// $("#overlay").click(function () {
//     $("#overlay").hide();
// });

$(document).ready(function () {
    $("#popbutton").on('click', function () {
        $("#loginBox").toggle();
    });
    $(".searchTerm").keypress(function (e) {
        if (e.which == 13) {
            Search();
        }
    });
    $(".searchButton").on('click', function (e) {
        Search();
    });
    $(".btn-upload2").on('click', function (e) {
        const fileUploader = document.querySelector('#input-file');
        const getFile = fileUploader.files
        if (getFile.length !== 0) {
            const uploadedFile = getFile[0];
            console.log(uploadedFile);
            callPutApi(uploadedFile.name, uploadedFile);
        } else {
            alert("No image selected!");
        }
    });
});

const handleChange = () => {
    const fileUploader = document.querySelector('#input-file');
    const getFile = fileUploader.files
    if (getFile.length !== 0) {
        const uploadedFile = getFile[0];
        readFile(uploadedFile);
    }
}

const readFile = (uploadedFile) => {
    if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = () => {
            const parent = document.querySelector('.preview-box');
            parent.innerHTML = `<img class="preview-content" src=${reader.result} />`;
        };

        reader.readAsDataURL(uploadedFile);
    }
};

function callSearchApi(tags) {
    // params, body, additionalParams
    console.log('enter callSearch');
    console.log(tags);
    console.log(sdk.searchGet({
        "q": tags,
        "x-api-key": "20glHC7NVQ8SKcdsVCUX84SmpCxJsbkz1VdPYYJn"
    }, {}, {}));
    return sdk.searchGet({
        "q": tags,
        "x-api-key": "20glHC7NVQ8SKcdsVCUX84SmpCxJsbkz1VdPYYJn"
    }, {}, {});
}

function Search() {
    tags = $('.searchTerm').val();
    if ($.trim(tags) == '') {
        return false;
    }
    callSearchApi(tags)
        .then((response) => {
            console.log(response);
            $('#wrapper').html("");
            data = response['data'];
            if (data == "No such photos.") {
                alert('found 0 related images!');
                return;
            }
            console.log(data);
            var container = $('#wrapper');
            for (i = 0; i < data.length; i++) {
                container.append('<img src="' + data[i] + '" id="single">');
            }
        })
        .catch((error) => {
            alert('error');
            console.log('an error occurred', error);
        });
}

function AudioSearch(tags) {
    callSearchApi(tags)
        .then((response) => {
            console.log(response);
            $('#wrapper').html("");
            data = response['data'];
            if (data == "No such photos.") {
                alert('found 0 related images!');
                return;
            }
            console.log(data);
            var container = $('#wrapper');
            for (i = 0; i < data.length; i++) {
                container.append('<img src="' + data[i] + '" id="single">');
            }
        })
        .catch((error) => {
            alert('error');
            console.log('an error occurred', error);
        });
}

function callPutApi(key, file) {
    // params, body, additionalParams
    console.log('enter put');
    console.log(key);
    var tags = $('#tags').val();
    console.log(tags);
    console.log(file);

    console.log("try upload!!!!!!!!!");

    var url = "https://3zl1te2ll5.execute-api.us-east-1.amazonaws.com/test-1/upload/photos-storehouse/" + key;
    fetch(url, {
        method: 'PUT',
        headers: {
            "x-amz-meta-customLabels": tags,
            "Content-Type": file.type
        },
        body: file
    }).then(response => {
        // return response.json()
    }).then(data =>
        console.log(data)
    );
}

