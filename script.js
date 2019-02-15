// localStorage['ankets'] = [];


var pageBlockedAnkets = [];

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

//r cli
//$('body').on('contextmenu', '.img-responsive', function(ev) {
  //  ev.preventDefault();
  //  window.open($(this).attr('href'), '_blank');
  //  return false;
//});

//click
$('body').on('click', '.img-responsive', function(ev) {
    ev.preventDefault();
    var id = $(this).find('img:eq(0)').attr('src').split('/')[6];
    send_message(id, $(this).parents('.tiles-item'));
    return false;
});

function send_message(uid, elem) {

  chrome.storage.local.get('Mess', function (result) {
  
    var message = result.Mess;

    var xhr = new XMLHttpRequest();
    
    var body = 'send=1&uid=' + uid + '&action=post&s_post=' + getCookie('s_post') + '&message=' + encodeURIComponent(message);

    xhr.open("POST", 'https://www.mamba.ru/my/message_post.phtml', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      
      if (xhr.status == 200) {
        elem.append('<div style="cursor: pointer;position: absolute;background: green;color: #000;height: 35px;width: 35px;margin-top: -234px;z-index: 99999;"></div>');
        // elem.style.backgroundColor = 'green'; 
      }

    }

    xhr.send(body);
    
  });

}

function isScrolledIntoView(el) {
  
/*
  var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    var isVisible = (elemBottom >= 0 && elemTop <= window.innerHeight) 
      || (elemTop <= window.innerHeight && elemBottom >= 0); //(elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
*/ 
 return isVisible;
}

var intersectionObserver = new IntersectionObserver(function(entries, self) {
  entries.forEach(function(entry) {
    if(entry.isIntersecting === false)
      return;

    if(localStorage['ankets'])
      db = JSON.parse(localStorage['ankets']);
    else 
      db = [];

    var id = entry.target.querySelector('a').getAttribute('href');
    id = id.substr(id.indexOf('/mb') + 3);
    id = id.substr(0, id.indexOf('?'));

    db.push(id);

    pageBlockedAnkets.push({
      'id': id,
      'elem': entry.target,
    });

    localStorage['ankets'] = JSON.stringify(db);

    self.unobserve(entry.target);
  });
}, {
  threshold: 1.0,
});

var hide = function(mutations) {
  if(localStorage['ankets'])
    db = JSON.parse(localStorage['ankets']);
  else 
    db = [];

  var count = 0;

  var mutationsCount = mutations.length;

  for(var i = 0; i < mutationsCount; ++i) {
    var mutation = mutations[i];

    if(mutation.addedNodes.length === 0 || mutation.target.classList.contains('b-tile') === false)
      continue;

    Array.prototype.forEach.call(mutation.addedNodes, function(node) {
      if(node.classList === void 0)
        return;

      if(node.classList.contains('b-tile__row') === false)
        return;

      var elems_anket = node.querySelectorAll('.b-tile__item-slot');

      Array.prototype.forEach.call(elems_anket, function(elem_anket) {
        if(elem_anket.classList.contains('b-tile__item_hidden') === true)
          return;

        if(elem_anket.querySelector('a') === null)
          return;

        var id = elem_anket.querySelector('a').getAttribute('href');
        id = id.substr(id.indexOf('/mb') + 3);
        id = id.substr(0, id.indexOf('?'));

        let sameBlocked = pageBlockedAnkets.some((anket) => {
          if(anket.id === id && anket.elem === elem_anket)
            return true;

          return false;
        });

        if(sameBlocked === true)
          return;

        if(db.indexOf(id) !== -1) {
          elem_anket.style.display = 'none';
          count++;
        }
        else {
          intersectionObserver.observe(elem_anket);
        }
      });
    });
  }


  // console.log(count + ' profiles was hidden');

/*
  var db;

  if(localStorage['ankets']) db = JSON.parse(localStorage['ankets']);
  else db = [];

  var ankets = document.querySelectorAll('.b-tile .b-tile__item-slot');
  
  var count = 0;
  
  for(var i = 0; i < ankets.length; i++) {

    var anket = ankets[i];
    
    var id = anket.querySelector('a').getAttribute('href');
    id = id.substr(id.indexOf('/mb') + 3);
    id = id.substr(0, id.indexOf('?'));
  
    if(db.indexOf(id) !== -1) {

      anket.style.display = 'none';
      count++;

    }
    else {

      db.push(id);

    }


  }

  localStorage['ankets'] = JSON.stringify(db);

  console.log(count + ' profiles was hidden');*/

  /*if(count == ankets.length) {
    
    var offset = document.querySelector('.pager .item.selected').nextSibling;
    while(offset && offset.nodeType != 1) {
      offset = offset.nextSibling
    }
    offset = offset.textContent;
    location = 'https://www.mamba.ru/search.phtml?rl=1&offset=' + (parseInt(offset) - 1) * ankets.length;

  }*/
  
};

var target = document.querySelector('.b-tile');

var observer = new MutationObserver(function(mutations) {
  if(location.pathname == '/search.phtml')
    hide(mutations);
});

observer.observe(target, {
  childList: true,
  subtree: true
});

let prevScroll = window.scrollY;

//scroll check
setInterval(() => {
  let currentScroll = window.scrollY;

  if(currentScroll < prevScroll) {
    prevScroll = currentScroll;

    return;
  }

  prevScroll = currentScroll;

  let elems_row = Array.from(document.querySelectorAll('.b-tile__row:not(.b-tile__item_hidden)'));

  //sort by translateY
  elems_row.sort((a, b) => {
    let transformString_1 = a.style.transform
      , transformValue_1 = parseInt(transformString_1.substr(11, transformString_1.length - transformString_1.indexOf('px') + 1))
      , transformString_2 = b.style.transform
      , transformValue_2 = parseInt(transformString_2.substr(11, transformString_2.length - transformString_2.indexOf('px') + 1));

      return transformValue_1 - transformValue_2;
  });

  //check if no one visible in viewport
  let isViewportFull = elems_row.some((elem_row) => {
    //if we have at least one visible slot in viewport - return true
    
    if(elem_row.getBoundingClientRect().bottom < 0)
      return false;

    if(elem_row.getBoundingClientRect().top > window.innerHeight)
      return false;

    let elems_slot = Array.from(elem_row.querySelectorAll('.b-tile__item-slot'));

    return elems_slot.some((elem_slot) => {
      if(elem_slot.querySelector('a') === null)
        return false;

      if(elem_slot.style.display !== 'none') {
        console.log(elem_slot);
        return true;
      }

      return false;
    });
  });

  if(isViewportFull === true)
    return;

  //find first visible row below viewport
  let firstBottomVisibleRow = elems_row.find((elem_row) => {
    if(elem_row.getBoundingClientRect().top <= window.innerHeight)
      return false;

    let elems_slot = Array.from(elem_row.querySelectorAll('.b-tile__item-slot'));

    return elems_slot.some((elem_slot) => {
      if(elem_slot.querySelector('a') === null)
        return false;

      if(elem_slot.style.display !== 'none') {
        console.log(elem_slot);
        return true;
      }

      return false;
    });
  });

  if(firstBottomVisibleRow !== void 0) {
    console.log(firstBottomVisibleRow);

   // firstBottomVisibleRow.scrollIntoView(true);
  }
  else
    elems_row[elems_row.length - 1];
}, 500);

/*if(location.pathname == '/search.phtml') 
  setTimeout(hide, 500);*/