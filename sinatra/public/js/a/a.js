document.addEventListener('DOMContentLoaded', function() {
  polling();
});

function xhr_request(method, url, synchro) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, synchro);
  xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
  xhr.responseType = "json";
  return xhr;
}

// polling
function polling() {
  setInterval(function() { 
     getQ();
     getA(false);
     getA(true);
  }, 1000);
}

function getA(all) {
  var q_id = document.getElementById('q_id').value;
  var xhr = xhr_request("GET", "/a/list/" + q_id, true);
  if (!q_id) {
    return;
  }
  xhr.onload = function (event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var res = xhr.response;
        var cur = document.getElementById('a_current');
        cur.innerHTML = res ? res.content : '';
      } else {
        console.log('response failed');
      }
    }
  }
  xhr.responseType = "json";
  xhr.send(null);

  getAAll();
}

function getAAll() {
  var q_id = document.getElementById('q_id').value;
  var xhr = xhr_request("GET", "/a/list/all/" + q_id, true);
  if (!q_id) {
    return;
  }
  xhr.onload = function (event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var res = xhr.response;
        var fragment = document.createDocumentFragment();
        var aList = document.querySelector('#ans_list');

        while (child = aList.lastChild) aList.removeChild(child);

        for (var i = 0; i < res.length; i++ ) {
          var aDiv = document.createElement('div');
          var pContent = document.createElement('p');

          aDiv.id = ("a_div_" + res[i].id);
          aDiv.classList.add("col-md-4");

          pContent.classList.add("text-left");
          pContent.classList.add("p_content");
          if (res[i].public) {
            pContent.classList.add((res[i].public_type == 1)? "pub_b" : "pub_r");
          }

          pContent.appendChild(document.createTextNode(res[i].content));

          aDiv.appendChild(pContent);
          fragment.appendChild(aDiv);
        }
        aList.appendChild(fragment);

      } else {
        console.log('response failed');
      }
    }
  }
  xhr.responseType = "json";
  xhr.send(null);
}

function getQ() {
  var xhr = xhr_request("GET", "/q/list/"+q_hash, true);
  xhr.onload = function (event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var res = xhr.response;
        var cur = document.getElementById('q_current');
        document.getElementById('q_id').value = res.id;
        cur.innerHTML = res.content ? res.content : '';
      } else {
        console.log('response failed');
      }
    }
  }
  xhr.responseType = "json";
  xhr.send(null);
}

function ajaxPostA() {
  var xhr = xhr_request("POST", "/a/reg", true);

  // TODO: refactoring
  var aParam = "a_user_id=" + encodeURIComponent(document.addform.a_user_id.value);
  aParam += "&content=" + encodeURIComponent(document.addform.content.value);
  aParam += "&q_id=" + encodeURIComponent(document.addform.q_id.value);
  xhr.send(aParam);

  xhr.onreadystatechange = function() {
    var addStatus = document.getElementById('add_status');
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        addStatus.classList.remove("text-danger");
        addStatus.classList.remove("text-muted");
        addStatus.classList.add("text-success");
        addStatus.innerHTML = "success!!";
      }
    } else if(xhr.status == 500) {
      addStatus.classList.remove("text-success");
      addStatus.classList.remove("text-muted");
      addStatus.classList.add("text-danger");
      addStatus.innerHTML = "failed!"
    } else {
      addStatus.classList.remove("text-muted");
      addStatus.classList.remove("text-danger");
      addStatus.classList.add("text-muted");
      addStatus.innerHTML = "connecting..."
    }
  }
}
