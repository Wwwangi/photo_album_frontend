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
        "q": tags
    }, {}, {}));
    return sdk.searchGet({
        "q": tags
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
    //var base64data = reader.result;
    //console.log(base64data);

    console.log("try upload!!!!!!!!!");

    var url = "https://3bzu0xvs6k.execute-api.us-east-1.amazonaws.com/test001/upload/photos-storehouse/" + key;

    const header = {
        "ACL": "public-read",
        "Access-Control-Allow-Origin" : "*",
        "x-amz-meta-customLabels": tags,
        "Content-Type": "image/jpeg"
    };

    axios.put(url, file, header).then(response => {
        console.log(response.data);
    });
    // }).catch(e => {
    //     console.log(e);
    // });

    // var xhr = new XMLHttpRequest();
    // xhr.open("PUT", url);
    //
    // xhr.setRequestHeader("Content-Type", "image/jpeg");
    // xhr.setRequestHeader("x-amz-meta-customLabels", tags);
    // xhr.setRequestHeader("Cache-Control", "no-cache");
    // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    // console.log(xhr, file)
    //
    // xhr.onreadystatechange = function () {
    //     if (xhr.readyState === 4) {
    //         console.log(xhr.status);
    //         console.log(xhr.responseText);
    //     }
    // };
    //
    // xhr.send(file);

    // var AWS = require('aws-sdk');
    //
    // AWS.config.update({
    //     accessKeyId: "AKIAXG3OXSRYUB6ZGR6P", // Access key ID
    //     secretAccesskey: "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", // Secret access key
    //     region: "us-east-1" //Region
    // })
    // const s3 = new AWS.S3();
    //
    // // Binary data base64
    // //const fileContent = Buffer.from(uploadedFile.data, 'binary');
    //
    // // Setting up S3 upload parameters
    // const params = {
    //     ACL: "public-read",
    //     Bucket: 'photos-storehouse',
    //     Key: key, // File name you want to save as in S3
    //     Body: file
    // };
    //
    // console.log(params)
    // // Uploading files to the bucket
    // s3.upload(params, function (err, data) {
    //     if (err) {
    //         throw err;
    //     }
    //     res.send({
    //         "response_code": 200,
    //         "response_message": "Success",
    //         "response_data": data
    //     });
    // });
    // return sdk.uploadBucketKeyPut({
    //     "key": key,
    //     "bucket": 'photos-storehouse',
    //     "x-amz-meta-customLabels": tags
    // }, base64data, {});
}



