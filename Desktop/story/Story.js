var currentStoryArr = 'storyItems';
var oldStoryArr = '';
var campaignId = 'cmp_b4b431041a000'

//! Default stories list ///////////////////////////////////////////////////////
var fetchStories = [{
        id: 'story-1',//StoryId
        name: '',//Mini story name
        picture: '',//Mini story image
        stories: {
            storyHero: '',//Story Hero
            storyTitle: '',//Story hero title
            isStoriesSeen: false,//Stories seen
            storyLine: [{
                id: 'story-11',
                redirectUrl: '',//Story button redirect url
                storyLineImage: '',//Story image
                isStorySeen: false,//Story seen
            }],
        },
    },
];

//! Helpers ///////////////////////////////////////////////////////
var helpers = {
    clone: function (obj) {
        return JSON.parse(JSON.stringify(obj))
    },
    getDevice: function () {
        var windowWidth = window.innerWidth;
        var deviceTypes = {
            mobile: windowWidth < 768,
            tablet: windowWidth >= 768 && windowWidth < 1024,
            desktop: windowWidth >= 1024,
        }
        var deviceTypesArr = Object.keys(deviceTypes);
        var device;

        for (var i = 0; i < deviceTypesArr.length; i++) {
            if (deviceTypes[deviceTypesArr[i]]) {
                device = deviceTypesArr[i];
            }
        }
        return device;
    },
    nodeToArr: function (arr) {
        var holderArr = [];
        for (var i = 0; i < arr.length; i++) {
            holderArr.push(arr[i]);
        }
        return holderArr;
    },
    find: function (arr, callBack) {
        var result;
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (callBack(item)) {
                result = item;
                break;
            }
        }
        return result;
    },
    filter: function (arr, callBack) {
        var resultArr = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (callBack(item)) {
                resultArr.push(item)
            }
        }
        return resultArr;
    },
    findIndex: function (arr, callBack) {
        var result;
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (callBack(item)) {
                result = i;
                break;
            }
        }
        return result;
    },
}

//! Define variables ///////////////////////////////////////////////////////
var stories;
var replaceableStories;
var isCanClickable = true;
var touchstartX = 0;
var touchendX = 0;
var interval;
var holderStories;
var clickedItem;

//! Generic Functions ///////////////////////////////////////////////////////

//TODO Close story
function closeStoryFunc() {
    document.querySelector('.stories-wrapper').classList.remove('story-open');
    document.querySelector('.stories-wrapper').classList.add('story-close');
    document.removeEventListener('touchstart', touchStart)
    document.removeEventListener('touchend', touchEnd)
    setTimeout(function(){
        document.querySelector('html').classList.remove('seg-close-scroll');
        document.querySelector('.story__layer').remove();
    }, 200);
    clearInterval(interval);
}

//TODO Send interaction
function sendInteraction(item) {
    if (window.Segmentify) {
        window.Segmentify("event:interaction", {
            type: "click",
            instanceId: campaignId,
            nextPage: true
        });
    }
}

//TODO Mobile swipe direction control
function checkDirection() {
    if (touchendX < touchstartX) {
        var currentStoryIndex = helpers.findIndex(stories, function (e) {
            return e.id === document.querySelector('.story-current').id
        })

        if (currentStoryIndex + 1 < holderStories.length && isCanClickable) {
            nextSlideAnimation(holderStories, currentStoryIndex);
        }
    }
    if (touchendX > touchstartX) {
        var currentStoryIndex = helpers.findIndex(stories, function (e) {
            return e.id === document.querySelector('.story-current').id
        })
        if (currentStoryIndex - 1 >= 0 && isCanClickable) {

            prevSlideAnimation(holderStories, currentStoryIndex);
        }
    }
}

//TODO Mobile swipe touch start
function touchStart(e) {
    touchstartX = e.changedTouches[0].screenX
}

//TODO Mobile swipe touch end
function touchEnd(e) {
    touchendX = e.changedTouches[0].screenX
    checkDirection();
}

//TODO Story close event add operation
function addClickCloseStory() {
    var closeArr = helpers.nodeToArr(document.querySelectorAll('.story__layer__close'));
    var buttonArr = helpers.nodeToArr(document.querySelectorAll('.story-shop-now-button'));

    closeArr.forEach(function (item, i) {
        item.addEventListener('click', closeStoryFunc)
    })

    buttonArr.forEach(function (item) {
        item.addEventListener('click', function () {
            sendInteraction(item);
        })
    })
}

//TODO Mini story sort change operation
function reOrderMiniStories(seenItem) {
    var miniStoryList = helpers.nodeToArr(document.querySelectorAll('.rounded-story'));
    var removedMiniStory = helpers.find(miniStoryList, function (e) {
        return e.getAttribute('id').toString() === seenItem.id;
    })
    var removedMiniStoryIndex = helpers.findIndex(miniStoryList, function (e) {
        return e.getAttribute('id').toString() === seenItem.id;
    })

    removedMiniStory.querySelector('.animated-border').remove();

    removedMiniStory.classList.add('story-seen');

    miniStoryList[removedMiniStoryIndex].remove();

    document.querySelector('.story__container').append(removedMiniStory);

}

//TODO Story is seen control
function changeStoryArrBySeen(selectedStory) {

    if (selectedStory) {
        var currentReplaceableStory = helpers.find(replaceableStories, function (e) {
            return e.id === selectedStory.id
        })
        if (!currentReplaceableStory.stories.isStoriesSeen) {
            var currentReplaceableStoryIndex = helpers.findIndex(replaceableStories, function (e) {
                return e.id === selectedStory.id
            })
            currentReplaceableStory.stories.isStoriesSeen = true;

            replaceableStories.splice(currentReplaceableStoryIndex, 1);
            replaceableStories.push(currentReplaceableStory);
            window.localStorage.setItem(currentStoryArr, JSON.stringify(replaceableStories))
            reOrderMiniStories(currentReplaceableStory)
        }
    }

}

//TODO ProgressBar animation operation
function addProgressBarAnimation() {
    document.querySelector('.story-current .progress').classList.add('active__story');
}

//TODO Story next-clone,prev-clone add operation
function addCloneStory(holderStories, index, _class) {
    if (holderStories[index]) {
        var story = document.createElement('div');
        if (_class === 'story-prev-clone') {
            document.querySelector('.stories-content-wrapper').prepend(story)
        } else {
            document.querySelector('.stories-content-wrapper').appendChild(story)
        }

        story.outerHTML = `
    <div class="story-content ${_class}" id="${holderStories[index].id}">
        <div class="story__layer__content__img">
            <div class="story-hero-wrapper">
                <div class="story-hero-image-wrapper">
                    <img class="story-hero-image" src="${holderStories[index].stories.storyHero}"/>
                </div>
                <div class="story-hero-title">
                    ${holderStories[index].stories.storyTitle}
                </div>
            </div>
            <div class="story__layer__close">
                <div class="layer__close__icon"></div>
            </div>
            ${addProgressBar(holderStories[index].stories.storyLine[0].id,_class)}
            <div style="pointer-events:none;user-select-none">
                <img src="${holderStories[index].stories.storyLine[0].storyLineImage}">
            </div>
            <a href="${holderStories[index].stories.storyLine[0].redirectUrl}" class="story-shop-now-button">
                COMPRAR AGORA
            </a>
        </div>
    </div>`

        document.querySelector(`#${holderStories[index].id} .story__layer__close`).addEventListener('click', closeStoryFunc)
        document.querySelector(`#${holderStories[index].id} .story-shop-now-button`).addEventListener('click', function () {
            sendInteraction(document.querySelector(`#${holderStories[index].id} .story-shop-now-button`));
        })
    }
}

//TODO Story left slide animation
function prevSlideAnimation(holderStories, currentIndex) {
    if ((!currentIndex && currentIndex != 0) || currentIndex - 1 < 0) {
        clearInterval(interval);
        closeStoryFunc();
        return;
    }

    isCanClickable = false;
    document.querySelector('.stories-content-wrapper').style.transition = 'all .3s linear';
    document.querySelector('.stories-content-wrapper').style.transform = helpers.getDevice() === 'mobile' ? 'translate(-50%,0) rotateY(90deg)' : 'rotateY(90deg)';
    document.querySelector('.story-current .active__story').classList.add('passed__story');
    document.querySelector('.story-current .active__story').classList.remove('active__story');
    document.querySelector('.story-arrow-right').classList.remove('seg-hidden')

    if (currentIndex - 1 === 0) {
        document.querySelector('.story-arrow-left').classList.add('seg-hidden');
    }
    clearInterval(interval);

    setTimeout(function(){
        document.querySelector('.stories-content-wrapper').style.transitionDuration = '0s';
        document.querySelector('.stories-content-wrapper').style.transform = helpers.getDevice() === 'mobile' ? 'translate(-50%,0) rotateY(0deg)' : 'rotateY(0deg)';

        if (document.querySelector('.story-next-clone')) {
            document.querySelector('.story-next-clone').remove();
        }

        if (document.querySelector('.story-next')) {
            document.querySelector('.story-next').classList.add('story-next-clone')
            document.querySelector('.story-next').classList.remove('story-next');
        }

        if (document.querySelector('.story-current')) {
            document.querySelector('.story-current').classList.add('story-next')
            document.querySelector('.story-current').classList.remove('story-current');
        }

        if (document.querySelector('.story-prev')) {
            document.querySelector('.story-prev').classList.add('story-current')
            document.querySelector('.story-prev').classList.remove('story-prev');
        }

        if (document.querySelector('.story-current .passed__story')) {
            document.querySelector('.story-current .passed__story').classList.remove('active__story');
            document.querySelector('.story-current .passed__story').classList.remove('passed__story');
        }

        if (document.querySelector('.story-prev-clone')) {
            document.querySelector('.story-prev-clone').classList.add('story-prev')
            document.querySelector('.story-prev-clone').classList.remove('story-prev-clone');
        }

        if (currentIndex !== 0)
            currentIndex--;

        if (document.querySelector('.current-story-mobile-dot')) {
            document.querySelector('.current-story-mobile-dot').classList.remove('current-story-mobile-dot');
        }

        var dots = helpers.nodeToArr(document.querySelectorAll('.story-mobile-dot'))
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('current-story-mobile-dot');
        }


        addProgressBarAnimation();
        startAnimation(holderStories, holderStories[currentIndex]);

        isCanClickable = true;

        if (currentIndex - 2 >= 0) {
            addCloneStory(holderStories, currentIndex - 2, 'story-prev-clone')
        }
    }, 300);
}

//TODO Story right slide animation
function nextSlideAnimation(holderStories, currentIndex) {
    isCanClickable = false;

    var nextItem = helpers.find(replaceableStories, function (e) {
        return e.id === holderStories[currentIndex + 1].id
    })
    if ((!currentIndex && currentIndex != 0) || currentIndex >= holderStories.length || (nextItem.stories.isStoriesSeen && clickedItem && !clickedItem.stories.isStoriesSeen)) {
        clearInterval(interval);
        closeStoryFunc();
        return;
    }

    if (currentIndex + 1 === holderStories.length - 1) {
        document.querySelector('.story-arrow-right').classList.add('seg-hidden')
    }

    document.querySelector('.stories-content-wrapper').style.transition = 'all .3s linear';
    document.querySelector('.stories-content-wrapper').style.transform = helpers.getDevice() === 'mobile' ? 'translate(-50%,0) rotateY(-90deg)' : 'rotateY(-90deg)';
    document.querySelector('.story-current .active__story').classList.add('passed__story');
    document.querySelector('.story-current .active__story').classList.remove('active__story');
    document.querySelector('.story-arrow-left').classList.remove('seg-hidden');

    clearInterval(interval)
    setTimeout(function () {
        document.querySelector('.stories-content-wrapper').style.transitionDuration = '0s';
        document.querySelector('.stories-content-wrapper').style.transform = helpers.getDevice() === 'mobile' ? 'translate(-50%,0) rotateY(0deg)' : 'rotateY(0deg)';

        if (document.querySelector('.story-prev-clone')) {
            document.querySelector('.story-prev-clone').remove();
        }

        if (document.querySelector('.story-prev')) {
            document.querySelector('.story-prev').classList.add('story-prev-clone');
            document.querySelector('.story-prev').classList.remove('story-prev');
        }

        if (document.querySelector('.story-current')) {
            document.querySelector('.story-current').classList.add('story-prev');
            document.querySelector('.story-current').classList.remove('story-current');
        }

        if (document.querySelector('.story-next')) {
            document.querySelector('.story-next').classList.add('story-current');
            document.querySelector('.story-next').classList.remove('story-next');
        }

        if (document.querySelector('.story-current .passed__story')) {
            document.querySelector('.story-current .passed__story').classList.remove('active__story');
            document.querySelector('.story-current .passed__story').classList.remove('passed__story');
        }

        if (document.querySelector('.story-next-clone')) {
            document.querySelector('.story-next-clone').classList.add('story-next');
            document.querySelector('.story-next-clone').classList.remove('story-next-clone');
        }

        currentIndex++;

        if (document.querySelector('.current-story-mobile-dot')) {
            document.querySelector('.current-story-mobile-dot').classList.remove('current-story-mobile-dot');
        }


        var dots = helpers.nodeToArr(document.querySelectorAll('.story-mobile-dot'))
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('current-story-mobile-dot');
        }

        addProgressBarAnimation();
        startAnimation(holderStories, holderStories[currentIndex]);

        isCanClickable = true;

        if (currentIndex + 2 < holderStories.length) {
            addCloneStory(holderStories, currentIndex + 2, 'story-next-clone');
        }

    }, 300)
}

//TODO ProgressBar add operation
function addProgressBar(id, tempClass) {
    return `
<div class="progress-wrapper">
    <div class="progress-container" id="${id}">
        <div style="animation-duration: 5s" class="progress ${tempClass === 'story-current' ? 'active__story' : ''}">
            <div class="passive__story__content">
            </div>
        </div>
    </div>
</div>`
}

//! Functions ///////////////////////////////////////////////////////

//TODO Start animation countdown
function startAnimation(holderStories, selectedStory) {
    if (selectedStory) {
        changeStoryArrBySeen(selectedStory);
        var currentIndex = helpers.findIndex(holderStories, function (e) {
            return e.id === selectedStory.id
        })

        interval = setInterval(function () {
            if (currentIndex + 1 < holderStories.length) {
                nextSlideAnimation(holderStories, currentIndex);
            } else {
                clearInterval(interval);
                closeStoryFunc();
            }
        }, 5e3)
    }

}

//TODO Stories render
function renderStories(holderStories, index, selectedStory) {
    var storyArr = [];

    function renderStoryItem(tempClass, item) {
        var storyContent = `
        <div class="story-content ${tempClass}" id="${item.id}">
            <div class="story__layer__content__img">
                <div class="story-hero-wrapper">
                    <div class="story-hero-image-wrapper">
                    <img class="story-hero-image" src="${item.stories.storyHero}"/>
                    </div>
                    <div class="story-hero-title">
                    ${item.stories.storyTitle}
                    </div>
                </div>
                <div class="story__layer__close">
                    <div class="layer__close__icon"></div>
                </div>
                ${addProgressBar(item.stories.storyLine[0].id,tempClass)}
                <div style="pointer-events:none;user-select-none">
                    <img src="${item.stories.storyLine[0].storyLineImage}">
                </div>
                <a href="${item.stories.storyLine[0].redirectUrl}" class="story-shop-now-button">
                    SAIBA MAIS
                </a>
            </div>
        </div>
    `
        storyArr.push(storyContent);
    }

    if (!selectedStory.stories.isStoriesSeen) {
        var tempStoriesArr = holderStories.slice(0, index);
        tempStoriesArr.forEach(function (item) {
            holderStories.push(item)
        })
    }

    holderStories.forEach(function (item, i) {
        var tempClass;
        if (i === index - 2) {
            tempClass = 'story-prev-clone'
            renderStoryItem(tempClass, item)
        } else if (i === index - 1) {
            tempClass = 'story-prev'
            renderStoryItem(tempClass, item)
        } else if (i === index) {
            tempClass = 'story-current'
            renderStoryItem(tempClass, item)
        } else if (i === index + 1) {
            tempClass = 'story-next'
            renderStoryItem(tempClass, item)
        } else if (i === index + 2) {
            tempClass = 'story-next-clone';
            renderStoryItem(tempClass, item)
        }
    })
    return storyArr.join('');
}

//TODO Mobile slide info dots render
function renderMobileDots(holderStories, index) {
    var result = '';

    for (var i = 0; i < holderStories.length; i++) {
        result += `
        <div class="${i===index ? 'current-story-mobile-dot' : ''} story-mobile-dot"></div>
    `
    }

    return result;
}

//TODO Story wrapper render 
function renderThreeDArea(layer, selectedStory) {
    var index = helpers.findIndex(holderStories, function (e) {
        return e.id === selectedStory.id
    });

    var threeDArea = `
    <div class="stories-wrapper story-open">
        <div class="story-arrow-left ${index===0 ? 'seg-hidden' : ''}"></div>
            <div class="stories-content-wrapper">
                ${renderStories(holderStories,index,selectedStory)}
            </div>
        <div class="story-arrow-right ${index===holderStories.length-1 ? 'seg-hidden' : ''}"></div>
        ${helpers.getDevice() === 'mobile' ?
            `<div class="story-mobile-dots-wrapper">
                ${renderMobileDots(holderStories,index)}
            </div>`
            :''
        }
    </div>
`
    layer.innerHTML = threeDArea;

    startAnimation(holderStories, selectedStory);
}

//TODO Story area render
function createStories(selectedStory) {
    var layer = document.createElement('div');
    layer.classList.add('story__layer');

    if (selectedStory.stories.isStoriesSeen) {
        holderStories = helpers.clone(stories)
    } else {
        var filteredStories = helpers.filter(stories, function (e) {
            return !e.stories.isStoriesSeen
        })
        holderStories = helpers.clone(filteredStories);
    }

    renderThreeDArea(layer, selectedStory);

    document.body.appendChild(layer);

    document.querySelector('.story-arrow-right').addEventListener('click', function () {
        var currentStoryIndex = helpers.findIndex(stories, function (e) {
            return e.id === document.querySelector('.story-current').id
        })

        if (currentStoryIndex + 1 < holderStories.length && isCanClickable) {
            nextSlideAnimation(holderStories, currentStoryIndex)
        }
    })

    document.querySelector('.story-arrow-left').addEventListener('click', function () {
        var currentStoryIndex = helpers.findIndex(stories, function (e) {
            return e.id === document.querySelector('.story-current').id
        })

        if (currentStoryIndex - 1 >= 0 && isCanClickable) {
            prevSlideAnimation(holderStories, currentStoryIndex);
        }
    })

    document.addEventListener('touchstart', touchStart)
    document.addEventListener('touchend', touchEnd)

    layer.addEventListener('click', function (e) {
        e.stopPropagation();
        if (e.target.className === 'story__layer') {
            closeStoryFunc();
        }
    })
    addClickCloseStory();
}

//TODO Mini stories click operation
function addClickMiniStories() {
    var miniStories = helpers.nodeToArr(document.querySelectorAll('.story__container .rounded-story'));
    miniStories.forEach(function (item, i) {
        item.addEventListener('click', function () {
            var id = '';
            if (item && item.getAttribute('id')) {
                id = item.getAttribute('id').toString();
            }
            if (id) {
                var storyItems = window.localStorage.getItem(currentStoryArr);
                stories = JSON.parse(storyItems);
                var selectedStory = helpers.find(stories, function (e) {
                    if (e.id === id)
                        return true
                })
                clickedItem = selectedStory;
                createStories(selectedStory);
                document.querySelector('html').classList.add('seg-close-scroll');
            }
        })
    })
}

//TODO Mini stories template
function generateMiniStory(story, device) {
    return `
<div class="rounded-story ${story.stories.isStoriesSeen ? 'story-seen' : 'story-not-seen'}" id=${story.id}>
    <div class="img__container">
    ${!story.stories.isStoriesSeen ?
        `
        <div class="animated-border">
            <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(255,165,70,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(251,156,74,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(247,148,79,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '35' : '40'}" fill="transparent" stroke="rgba(243,139,83,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,97)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(239,130,87,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(235,121,91,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(231,113,96,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(227,104,100,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(224,95,104,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(220,86,108,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(216,78,113,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(212,69,117,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(208,60,121,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(204,51,125,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(200,43,130,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(196,34,134,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(200,43,130,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(204,51,125,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(208,60,121,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(212,69,117,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(216,78,113,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(220,86,108,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(224,95,104,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(227,104,100,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(231,113,96,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(235,121,91,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(239,130,87,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(243,139,83,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(247,148,79,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
                <div class="animated-dot-wrapper">
                <svg class="animated-dot" width="${device === 'mobile' ? '90' : '120'}" height="${device === 'mobile' ? '90' : '120'}">
                    <circle cx="${device === 'mobile' ? '45' : '75'}" cy="${device === 'mobile' ? '25' : '75'}" r="${device === 'mobile' ? '34' : '40'}" fill="transparent" stroke="rgba(251,156,74,1)" stroke-dasharray="${device === 'mobile' ? '7, 5000':'11, 5000'}" stroke-width="${device === 'mobile' ? '2' : '3'}" stroke-linecap="round" transform="${device === 'mobile' ? 'rotate(-8,110,90)' : 'rotate(13,110,90)'}"></circle>
                </svg>
                </div>
            </div>
                `:''
            }
            <img src=${story.picture} alt="" />
        </div>
        <div class="text__container">${story.name}</div>
    </div>
`
}

//TODO Create mini stories
function createMiniStories() {
    var miniStoriesList = [];
    var device = helpers.getDevice();

    stories.forEach(function (story, i) {
        var miniStory = generateMiniStory(story, device);
        miniStoriesList.push(miniStory);
    })

    var storyContainer = document.querySelector('.story__container');
    storyContainer.innerHTML = miniStoriesList.join('');
}

//TODO Stories arr defination
function setStories() {
    var storyItems = window.localStorage.getItem(currentStoryArr);
    var oldStoryItems = window.localStorage.getItem(oldStoryArr);

    if (oldStoryItems) window.localStorage.removeItem(oldStoryArr);

    if (storyItems) {
        stories = JSON.parse(storyItems);
        replaceableStories = JSON.parse(storyItems);
    } else {
        stories = helpers.clone(fetchStories);
        replaceableStories = helpers.clone(fetchStories);
        window.localStorage.setItem(currentStoryArr, JSON.stringify(stories))
    }
    createMiniStories();
    addClickMiniStories()
}

setStories();