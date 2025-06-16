// add street assets
document.querySelectorAll('.street').forEach(street => {
    const assetId = street.id;
    const image = document.createElement('img');

    image.src = `./assets/${assetId}.jpg`;
    image.alt = street.id;

    street.appendChild(image);

    street.style.display = "none";

    image.setAttribute('draggable', false);
});

//public variables
let street = '0-0-0';
let publicItem;
let publicDialogImageClicked;
let publicImg;
let publicTxt;
let isAnimating = false; // prevent animation spamming


// Cookies
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

document.addEventListener('DOMContentLoaded', () => {
  const match = document.cookie.match('(?:^|; )street=([^;]*)');
  street = match ? decodeURIComponent(match[1]) : street;
  document.cookie = `street=${encodeURIComponent(street)};path=/;max-age=${COOKIE_MAX_AGE}`;
});
// Erase cookie on 'R' key press
document.addEventListener('keydown', e => {
if (e.key.toLowerCase() === 'r' && e.shiftKey) {
    document.cookie = 'street=;path=/;max-age=0';
}
});


// start game
setTimeout(() => {
    document.getElementById('transitionScreen').classList.add('fadeout');
}, 200);
const startGame = () => {
    const mainstreet = document.getElementById(street)
    const startscreen = document.getElementById('start')
    const debugtext = document.getElementById('debug_text')
    startscreen.remove();
    mainstreet.style.display = "block"
    debugtext.style.display = "block"
    generateArrows(mainstreet);
}

const switchto = (from, to) => {
    document.getElementById(from).style.display = 'none'
    document.getElementById(to).style.display = 'flex'
}

const generateArrows = (item) => {

    street = item.id;
    document.cookie = `street=${encodeURIComponent(street)};path=/;max-age=${COOKIE_MAX_AGE}`;

    for (const key in item.dataset) {


        // Arrow Objects

        if (['left', 'right', 'top', 'bottom', 'center'].includes(key)) {
            arrow = item.dataset[key];
            
            const newArrow = document.createElement('div');

            newArrow.classList.add('arrow');
            newArrow.classList.add(key);

            newArrow.addEventListener('mouseup', (function(arrowCopy) {
                return function() {
                    moveToStreet(item, document.getElementById(arrowCopy), key);
                };
            })(arrow));


            newArrow.style.background = `url("./assets/${item.id}-${key}.png")`;

            item.appendChild(newArrow);


            if (item.dataset[`${key}Offset`]) {
                let offsets = item.dataset[`${key}Offset`].split(",")

                newArrow.style.top = `calc(${window.getComputedStyle(newArrow).top} - ${offsets[0]})`;
                newArrow.style.left = `calc(${window.getComputedStyle(newArrow).left} - ${offsets[1]}`;
            }
        }


        // Hover Objects
        
        if (['hover_'].includes(key.substring(0, 6))) {
            const num = key.substring(6, 7);


            // hitbox
            const newHoverDialogHitbox = document.createElement('div');
            
            newHoverDialogHitbox.classList.add('dialog_hover');
            newHoverDialogHitbox.classList.add('hitbox');

            item.appendChild(newHoverDialogHitbox);

            (function(copy) {
                if (item.dataset[`hoverHitboxOffset_${num}`]) {
                    let offsets = item.dataset[`hoverHitboxOffset_${num}`].split(",")

                    copy.style.top = `calc(${window.getComputedStyle(copy).top} - ${offsets[0]})`;
                    copy.style.left = `calc(${window.getComputedStyle(copy).left} - ${offsets[1]}`;
                }
            })(newHoverDialogHitbox);

            if (item.dataset[`hoverHitboxSize_${num}`]) {
                let sizes = item.dataset[`hoverHitboxSize_${num}`].split(",");
                newHoverDialogHitbox.style.height = sizes[0];
                newHoverDialogHitbox.style.width = sizes[1];
            }


            // textbox
            const newHoverDialogTextbox = document.createElement('div');
            
            newHoverDialogTextbox.classList.add('dialog_hover');
            newHoverDialogTextbox.classList.add('textbox');

            item.appendChild(newHoverDialogTextbox);

            (function(copy) {
                if (item.dataset[`hoverTextOffset_${num}`]) {
                    let offsets = item.dataset[`hoverTextOffset_${num}`].split(",")
    
                    copy.style.top = `calc(${window.getComputedStyle(copy).top} - ${offsets[0]})`;
                    copy.style.left = `calc(${window.getComputedStyle(copy).left} - ${offsets[1]}`;
                }
            })(newHoverDialogTextbox);

            newHoverDialogTextbox.textContent = item.dataset[`${key}`];

            
            // hovers
            newHoverDialogHitbox.addEventListener('mouseenter', (function(copy) {
                return function() {
                    copy.classList.add('hovered');
                }
            })(newHoverDialogTextbox));
            
            newHoverDialogHitbox.addEventListener('mouseleave', (function(copy) {
                return function() {
                    copy.classList.remove('hovered');
                }
            })(newHoverDialogTextbox));
        }


        // Image Objects

        if (['imgobj_'].includes(key.substring(0, 7))) {
            const num = key.substring(7, 8);

            const newImgObj = document.createElement('div');
            
            newImgObj.classList.add('imgobj');

            // css styles
            newImgObj.style.background = `url(${item.dataset[`imgobj_${num}`].replace(/\\+/g, '/')})`;

            const sizes = item.dataset[`imgobjSize_${num}`].split(",")
            newImgObj.style.height = sizes[0];
            newImgObj.style.width = sizes[1];

            item.appendChild(newImgObj);

            (function(copy) {
                if (item.dataset[`imgobjOffset_${num}`]) {
                    const offsets = item.dataset[`imgobjOffset_${num}`].split(",")

                    copy.style.top = `calc(${window.getComputedStyle(copy).top} - ${offsets[0]})`;
                    copy.style.left = `calc(${window.getComputedStyle(copy).left} - ${offsets[1]}`;
                }
            })(newImgObj);

            if (item.dataset[`imgobjOnclick_${num}`]) {
                newImgObj.addEventListener('click', (function(copy) {
                    return function() {
                        publicItem = item;
                        publicDialogImageClicked = copy
                        new Function(item.dataset[`imgobjOnclick_${num}`])();
                    };
                })(newImgObj));
            }
        }
    }
}

const moveToStreet = (from, to, key) => {
    if (isAnimating) return; // Prevent spamming
    isAnimating = true;

    to.style.display = 'block';
    to.style.zIndex = '0';
    
    from.style.zIndex = '999999999';

    let fadeDirection = from.dataset[`${key}Animate`] ? from.dataset[`${key}Animate`] : key;

    from.classList.add(`animate${fadeDirection}`);
    from.addEventListener('animationend', function handler() {
        from.style.display = 'none';
        from.classList.remove(`animate${fadeDirection}`);
        from.removeEventListener('animationend', handler);
        from.style.zIndex = '0';
        clearObjects();
        isAnimating = false; // Allow next animation
    });

    street = to.id;
    document.cookie = `street=${encodeURIComponent(street)};path=/;max-age=${COOKIE_MAX_AGE}`;

    generateArrows(to);

    document.getElementById('debug_text').innerHTML=street;
}

const clearObjects = () => {
    const currentStreet = document.getElementById(street);

    // Remove all arrows not under the current street
    const allArrows = document.getElementsByClassName('arrow');
    for (let i = allArrows.length - 1; i >= 0; i--) {
        if (!currentStreet.contains(allArrows[i])) {
            allArrows[i].remove();
        }
    }

    // Remove all imgobj not under the current street
    const allimgobj = document.getElementsByClassName('imgobj');
    for (let i = allimgobj.length - 1; i >= 0; i--) {
        if (!currentStreet.contains(allimgobj[i])) {
            allimgobj[i].remove();
        }
    }

    // Remove all dialog_hover not under the current street
    const allhover = document.getElementsByClassName('dialog_hover');
    for (let i = allhover.length - 1; i >= 0; i--) {
        if (!currentStreet.contains(allhover[i])) {
            allhover[i].remove();
        }
    }
}

// Ratio warning
function checkAspectRatio() {
    const ratio = window.innerWidth / window.innerHeight;
    const warning = document.getElementById('warning');
    if (!warning) return;

    if (Math.abs(ratio - (16 / 9)) > 0.02) {
        warning.style.display = '';
    } else {
        warning.style.display = 'none';
    }
}
window.addEventListener('resize', checkAspectRatio);
window.addEventListener('DOMContentLoaded', checkAspectRatio);
setInterval(checkAspectRatio, 1000);










// - - - COOL ROMANTIC DIALOGUES - - - //

// Dialogue Ready Functions

const dialog_Cover = (item, removables, to, unhide) => {
    const cover = document.createElement('div');
    cover.setAttribute("id", "cover");
    
    Object.assign(cover.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '4',
      background: 'transparent',
      pointerEvents: 'auto',
    });
  
    item.appendChild(cover);

    cover.addEventListener('click', (function(copy) {
        return function() {
            removables.forEach(el => {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
    
            copy.remove(); // Remove current cover
            if (to == '') {unhide.style.display = "block";}
    
            // DEFER next dialog to next event loop tick
            if (to !== '') {
                    setTimeout(() => {
                    new Function(to)();
                }, 0);
            };
        }
    })(cover));
    
    return cover;
  };

const dialog_Img = (url, width, height, top, left, reverse, item) => {
    const newImgObj = document.createElement('div');
    
    newImgObj.classList.add('imgobj');

    // css styles
    newImgObj.style.background = `url(${url})`;

    if (reverse == "reverse") {newImgObj.style.transform = 'scaleX(-1)';}

    newImgObj.style.width = width;
    newImgObj.style.height = height;

    item.appendChild(newImgObj);

    (function(copy) {
        copy.style.top = `calc(${window.getComputedStyle(copy).top} - ${top})`;
        copy.style.left = `calc(${window.getComputedStyle(copy).left} - ${left}`;
    })(newImgObj);

    return newImgObj;
}

const dialog_Txt = (name, text, top, left, item, choices) => {
    // dialog div
    const newObj = document.createElement('div');
    newObj.classList.add('dialog');

    // name div
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    // Add SVG icon before the name text
    nameDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="currentColor" fill-opacity="0" stroke-dasharray="72" stroke-dashoffset="72" d="M3 19.5v-15.5c0 -0.55 0.45 -1 1 -1h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-14.5Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.15s" values="0;0.3"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="72;0"/></path><path stroke-dasharray="10" stroke-dashoffset="10" d="M8 7h8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.85s" dur="0.2s" values="10;0"/></path><path stroke-dasharray="10" stroke-dashoffset="10" d="M8 10h8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.15s" dur="0.2s" values="10;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M8 13h4"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.45s" dur="0.2s" values="6;0"/></path></g></svg>
    <p>${name}</p>`;
    newObj.appendChild(nameDiv);
    
    // text div
    const newText = document.createElement('div');
    newText.classList.add('text');
    newText.appendChild(document.createTextNode(text));
    newObj.appendChild(newText);

    // click to continue
    if (!choices || choices.length === 0) {
        const clickToContinue = document.createElement('span');
        clickToContinue.classList.add('clickTo');
        clickToContinue.textContent = ' (click on the screen to continue)';
        newObj.appendChild(clickToContinue);
    }

    // choices
    if (choices && choices.length > 0) {
        const choicesDiv = document.createElement('div');
        choicesDiv.classList.add('choices');
        choices.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.textContent = choice;
            choiceButton.addEventListener('click', (function(copy) {
                return function() {
                    const cover = document.getElementById('cover');// declared after click
                    cover.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
            })(newObj));
            choicesDiv.appendChild(choiceButton);
        });
        newObj.appendChild(choicesDiv);
    }


    item.appendChild(newObj);

    (function(copy) {
        copy.style.top = `calc(${window.getComputedStyle(copy).top} - ${top})`;
        copy.style.left = `calc(${window.getComputedStyle(copy).left} - ${left})`;
    })(newObj);

    return newObj;
}


// Func Dialogues

// -Shinji
const dialog_ShinjiSitting = () => {
    publicDialogImageClicked.style.display = "none"
    const img = dialog_Img("./assets/ShinjiScared.webp", "25vw", "40vw", "-30vw", "35vw", "reverse", publicItem);
    const txt = dialog_Txt("Man", "My crush rejected me...", "-50vw", "-10vw", publicItem, []);

    dialog_Cover(publicItem, [img, txt], 'dialog_ShinjiSitting_1()', publicDialogImageClicked)
}


const dialog_ShinjiSitting_1 = () => {
    publicDialogImageClicked.style.display = "none"
    const img = dialog_Img("./assets/ShinjiHurt.png", "25vw", "40vw", "-30vw", "35vw", "reverse", publicItem);
    const txt = dialog_Txt("Man", "I hope yours does too! Go to hell!", "-50vw", "-10vw", publicItem, []);

    dialog_Cover(publicItem, [img, txt], '', publicDialogImageClicked)
}




// -Rei
const dialog_ReiSitting = () => {
    publicDialogImageClicked.style.display = "none"
    const img = dialog_Img("./assets/ReiStanding.webp", "25vw", "40vw", "-30vw", "35vw", "reverse", publicItem);
    const txt = dialog_Txt("Woman", "I don't talk to weirdos... keep yourself safe.", "-50vw", "-10vw", publicItem, []);

    dialog_Cover(publicItem, [img, txt], '', publicDialogImageClicked)
}







// -Boss

const dialog_Boss = () => {
    publicDialogImageClicked.style.display = "none"
    const img = dialog_Img("./assets/monster.png", "25vw", "40vw", "-20vw", "-10vw", "normal", publicItem);
    const txt = dialog_Txt("Xatziarapis", "Oh? You're Approaching Me?", "-40vw", "-40vw", publicItem, ["Nah"]);

    dialog_Cover(publicItem, [img, txt], '', publicDialogImageClicked)
}



