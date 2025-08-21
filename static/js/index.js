// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// - - - - - - - - - - - Gallery mover - - - - - - - - - - - //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const arrowLeft = document.querySelector(".arrow_left");
const arrowRight = document.querySelector(".arrow_right");
const galleryLayer = document.querySelector(".gallery_layer")
const galleryImagesContainer = document.querySelector(".gallery_images_wrapper")
const galleryImagesArray = Array.from(document.querySelector(".gallery_images_wrapper").children);
const imgCount = galleryImagesArray.length
const transformTime = "1400";

let isProcessing = false; // Block multiple clicks, let whole processing finish and only then allow next iteration


// * * * * * * * * * * * * * * * Image order mover * * * * * * * * * * * * * * * //

    mainImgCaller = () => {
        const futureOrder = imgMover(); // Returned from function, already calculated, no need for second calculation
        dotTracker(); // Track position of the image
        flexOrderApplier(futureOrder); // Apply order
    }

    flexOrderCalc = (imgArray) => {
    // Loop through each image and calculate next order of images in flexbox

        const imgOrderArray = imgArray.map(img => {
            let imgOrder = img.style.order;
            imgOrder = Number(imgOrder) - idx; // Current image position incremented by idx
            if (imgOrder > imgCount) {imgOrder = 1}; // Last image goes back to the front
            if (imgOrder == 0) {imgOrder = imgCount}; // First image goes to the back
            return imgOrder;
        })
        return imgOrderArray;
    }

    flexOrderApplier = (fo) => {
    // Sleep for time it takes for images to transform from one place to another
    // Then, apply flexbox's order to the image container

    setTimeout(() => {
            galleryImagesArray.forEach((img, index) => {
                img.style.transform = "none";
                img.style.transition = "none";
                img.style.order = fo[index];
                if (idx == -1 && img.style.order == 1) {img.style.zIndex = "0"}; // Traversing image from 3rd position to first was sent back, now reset its zIndex. Otherwise after few clicks all images would have zIndex -1
                isProcessing = false; // Reset flag when done <LAST STEP>
            })
        }, transformTime);
    }

    imgMover = () => {
    // Creates 2 duplicate containers of images container
    // Apply enlargement of image in-focus on first duplicate
    // Apply the same, and also future order of images
    // Position difference and new order these temp containers are then applied to the original one

        // Calculate where each image will be after reordering
        const futureOrder = flexOrderCalc(galleryImagesArray);

        // Create temp container 1
        tempContainer1 = galleryLayer.cloneNode(true);
        tempContainer1.style.position = "absolute";
        tempContainer1.style.visibility = "hidden";
        tempContainer1.style.position = "absolute";
        document.body.append(tempContainer1);

        // Create temp container 2
        tempContainer2 = galleryLayer.cloneNode(true);
        tempContainer2.style.position = "absolute";
        tempContainer2.style.visibility = "hidden";
        tempContainer2.style.position = "absolute";
        tempContainer2.style.top = "115px";
        document.body.append(tempContainer2);

        // Move image order of the temp container 1 and apply enlargement of in-focus image
        const tempContainer1Array = Array.from(tempContainer1.children[0].children); // class "gallery_images_wrapper" (children) needs to stay 1st in "gallery_layer" (parent). Last .children are images
        tempContainer1Array.forEach((img, index) => {
            img.style.order = futureOrder[index]; // Apply future flexbox order on the container
            focusImageCalc(img, index, img.style.order); // Adjust width of images depending whether they are in-focus or not
        })

        // Apply only enlargement of in-focus image on temp container 2
        const tempContainer2Array = Array.from(tempContainer2.children[0].children); // class "gallery_images_wrapper" (children) needs to stay 1st in "gallery_layer" (parent). Last .children are images
        tempContainer2Array.forEach((img, index) => {
            focusImageCalc(img, index, futureOrder[index]); // Adjust width of images depending whether they are in focus or not
        })

        // Calculate position of images in temp container 1
        const tempContainer1Dimensions = tempContainer1Array.map(img => {
            return img.getBoundingClientRect();
        })

        // Calculate position of images in temp container 2
        const tempContainer2Dimensions = tempContainer2Array.map(img => {
            return img.getBoundingClientRect();
        })

        // Remove temp containers from body
        document.body.removeChild(tempContainer1);
        document.body.removeChild(tempContainer2);

        // Apply transformations on original container based on temp containers
        galleryImagesArray.forEach((img, index) => {

            // Image being moved from 3rd position to first is being hidden during the translation, and in the middle of transformation opacity is being brought back. E.g. being hidden for 0.7s, then being progressively visible another 0.7s
            if (idx == -1 && img.style.order == 3) {
                img.style.zIndex = "-1",
                img.style.opacity = "0";
                setTimeout(() => {
                    img.style.opacity = "1";
                }, transformTime / 2); // Bring back visibility for half the time of transformation
            };

            // Image being moved from 1st position to 3rd is being hidden during the translation, and in the middle of transformation opacity is being brought back. E.g. being hidden for 0.7s, then being progressively visible another 0.7s
            if (idx == 1 && img.style.order == 1) {
                img.style.zIndex = "-1",
                img.style.opacity = "0";
                setTimeout(() => {
                    img.style.opacity = "1";
                }, transformTime / 2); // Bring back visibility for half the time of transformation
            };

            img.style.transition = `transform ${transformTime}ms ease-in-out, width ${transformTime}ms ease-in-out, opacity ${transformTime / 2}ms ease-in-out`;

            let distance = tempContainer1Dimensions[index].left - tempContainer2Dimensions[index].left;
            img.style.width = `${tempContainer1Dimensions[index].width}px`;
            img.style.transform = `translateX(${distance}px)`;
        })

        return futureOrder;
    }

    const originalImagesWidth = galleryImagesArray.map((img, index) => {
    // Return original image's width. Needed as the subsequent function modifies it, and we need to return to the original size everytime
    // Image on index 1 (second in sequence) needs to be measured before enlarging it

        let wd = img.getBoundingClientRect().width;
        if (index == 1) {img.style.width = `${wd * 1.15}px`}; // Enlarge right away on page load width of in-focus image
        return wd;
    })

    focusImageCalc = (img, index, imgOrder) => {
    // Check idx (movement left or right), and based on it, enlarge and decrease subsequent images

        // Movement right
        if (idx == 1) {
            if (imgOrder == 2) {img.style.width = `${originalImagesWidth[index] * 1.15}px`;} // Enlarge in-focus image
            else if (imgOrder == 1) {img.style.width = `${originalImagesWidth[index] * 1}px`;}; // Decrease outgoing in-focus image being moved to 1st position to its original size
        }

        // Movement left
        else if (idx == -1) {
            if (imgOrder == 3) {img.style.width = `${originalImagesWidth[index] * 1}px`; img.style.zIndex = "1"} // Decrease outgoing in-focus image being moved to 3rd position to its original size
            else if (imgOrder == 2) {img.style.width = `${originalImagesWidth[index] * 1.15}px`; img.style.zIndex = "1"}; // Enlarge in-focus image
        };
    }

// * * * * * * * * * * * * * * * Gallery dot tracker * * * * * * * * * * * * * * * //

    const galleryDotActive = document.querySelector(".gallery_dot_active");

    let dotTransform = 20; // Starts at translateX(20px) in the html file
    let minDotPosition = 0;
    let maxDotPosition = (imgCount - 1) * dotTransform; // -1 of total count of images as the dot starts at the second position everytime
    
    dotTracker = () => {
        dotTransform += 20 * idx; // Move by 20px, idx indicates direction left or right
        let transformDot = galleryDotActive.style.transform
        galleryDotActive.style.transition = `transform ${transformTime}ms ease`;

        if (dotTransform > maxDotPosition) {transformDot = `translateX(${minDotPosition}px)`; dotTransform = minDotPosition;} // If the dot reaches end, translate it to the start
        else if (dotTransform < minDotPosition) {transformDot = `translateX(${maxDotPosition}px)`; dotTransform = maxDotPosition;} // If the dot goes beyond start, translate it to the end
        else {transformDot = `translateX(${dotTransform}px)`;}; // Else just move left-right by one position
        galleryDotActive.style.transform = transformDot; // Apply back
    }


// * * * * * * * * * * * * * * * Events * * * * * * * * * * * * * * * //
    arrowRight.addEventListener("click", () => {
        if (isProcessing) return;
        isProcessing = true;
        idx = 1;
        mainImgCaller();
    })

    arrowLeft.addEventListener("click", () => {
        if (isProcessing) return;
        isProcessing = true;
        idx = -1;
        mainImgCaller();
    })


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// - - - - - - - - - - - Removal of url change - - - - - - - - - - - //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const navButton1 = document.querySelector(".nav_button_1")
const navButton2 = document.querySelector(".nav_button_2")
const navButton3 = document.querySelector(".nav_button_3")

$('.nav_button_1').on("click", function(e) {
    e.preventDefault();
    $("html, body").animate({
        scrollTop: $("#id_gallery").offset().top
        }, 1400
    )
})

$('.nav_button_2').on("click", function(e) {
    e.preventDefault();
    $("html, body").animate({
        scrollTop: $("#id_map").offset().top
        }, 2000
    )
})

$('.nav_button_3').on("click", function(e) {
    e.preventDefault();
    $("html, body").animate({
        scrollTop: $("#id_contact_form").offset().top
        }, 2600
    )
})


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
// - - - - - - - - - - - Google maps adjustments - - - - - - - - - - - //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

function initMap() {
  const map = new google.maps.Map(document.getElementById("id_map_ref"), {
    zoom: 4,
    center: { lat: -33, lng: 151 },
    disableDefaultUI: true,
  });
}

window.initMap = initMap;