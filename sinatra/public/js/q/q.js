document.addEventListener('DOMContentLoaded', function() {
  getQList();
  polling();
});

function refresh() {
  getQList();
  var radioList = document.getElementsByName("q_radio");
  for (var i = 0; i < radioList.length; i++){
    if (radioList[i].checked) {
      var cur = document.getElementById('q_current');
      cur.innerHTML = radioList[i].value;
      qId = radioList[i].id.replace(/[^0-9^\.]/g,"")
      break;
    }
  }
  if (typeof qId !== "undefined") {
    getAList(qId);
  }
}

// polling
function polling() {
  var radioList = document.getElementsByName("q_radio");
  setInterval(function() { 
    for (var i = 0; i < radioList.length; i++){
      if (radioList[i].checked) {
        var cur = document.getElementById('q_current');
        cur.innerHTML = radioList[i].value;
        qId = radioList[i].id.replace(/[^0-9^\.]/g,"")
        break;
      }
    }
    if (typeof qId !== "undefined") {
      getAList(qId);
    }
  }, 500);
}

function xhr_request(method, url, synchro) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, synchro);
  xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
  xhr.responseType = "json";
  return xhr;
}

function chCol(d, color) {
  var aId = d.id.replace(/[^0-9^\.]/g,"")
  updateA(aId, color);
}

function getAList(qId){
  var xhr = xhr_request("GET", "/a/list/" + qId, true);
  xhr.onload = function (event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var res = xhr.response
        if (is_null(res)
        var fragment = document.createDocumentFragment();
        var aList = document.querySelector('#ans_list');

        while (child = aList.lastChild) aList.removeChild(child);
        if (!!!res) {
          alert('セッションが切れました。ログインし直してください。');
          location.reload();
        }
        if (0 < res.length) {
          for (var i = 0; i < res.length; i++ ) {
            var aDiv = document.createElement('div');
            var pName = document.createElement('p');
            var pContent = document.createElement('p');
            var colorDivB = document.createElement('div');
            var colorDivR = document.createElement('div');

            aDiv.id = ("a_div_" + res[i].id);
            aDiv.classList.add("col-md-4");

            pName.classList.add("text-left");
            pName.classList.add("p_name");
            pName.appendChild(document.createTextNode(res[i].name));

            pContent.classList.add("text-left");
            pContent.classList.add("p_content");
            if (res[i].public) {
              pContent.classList.add((res[i].public_type == 1)? "pub_b" : "pub_r");
            }

            pContent.appendChild(document.createTextNode(res[i].content));

            colorDivB.id = ("q_color_" + res[i].id);
            colorDivB.classList.add("color_div_b");
            colorDivB.onclick = function() {
                chCol(this, "B");
            }
            colorDivR.id = ("q_color_" + res[i].id);
            colorDivR.classList.add("color_div_r");
            colorDivR.onclick = function() {
                chCol(this, "R");
            }


            aDiv.appendChild(pName);
            aDiv.appendChild(pContent);
            aDiv.appendChild(colorDivB);
            aDiv.appendChild(colorDivR);
            fragment.appendChild(aDiv);
          }
          aList.appendChild(fragment);
        } else {
          aList.appendChild(document.createTextNode("※まだ回答はありません"));
        }
      } else {
        console.log('response failed');
      }
    }
  }
  xhr.send(null);
}


function displayCurrentQ() {
  var radioList = document.getElementsByName("q_radio");
  for (var i = 0; i < radioList.length; i++){
    if (radioList[i].checked) {
      cur = document.getElementById('q_current');
      cur.innerHTML = radioList[i].value;
      qId = radioList[i].id.replace(/[^0-9^\.]/g,"")
      updateQ(qId);
      getAList(qId);
      break;
    }
  }
}

function updateA(checkedAId, color) {
  var xhr = xhr_request("POST", "/a/update", true);
  // TODO: refactoring
  var aParam = "a_id=" + encodeURIComponent(checkedAId);
  aParam += "&color=" + encodeURIComponent(color);
  xhr.send(aParam);
}

function updateQ(checkedQId) {
  var xhr = xhr_request("POST", "/q/update", true);
  // TODO: refactoring
  var qParam = "q_id=" + encodeURIComponent(checkedQId);
  xhr.send(qParam);
}

function getQList() {
  var xhr = xhr_request("GET", "/q/list/"+q_hash, true);
  xhr.onload = function (event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var res = xhr.response;
        var fragment = document.createDocumentFragment();
        var qList = document.querySelector('#q_list');
        while (child = qList.lastChild) qList.removeChild(child);

        if (!!!res) {
          alert('セッションが切れました。ログインし直してください。');
          location.reload();
        }
        if (0 < res.length) {
          for (var i = 0; i < res.length; i++ ) {
            var qDiv = document.createElement('div');
            var qLabel = document.createElement('label');
            var qRadio = document.createElement('input');
            qDiv.id = "q_list" + res[i].id;
            qDiv.classList.add("col-md-12");
            qDiv.classList.add("text-left");

            qLabel.classList.add("radio-inline");

            qRadio.type = "radio";
            qRadio.id = "q_radio_" + res[i].id;
            qRadio.name = "q_radio";
            qRadio.class = "list_radio";
            qRadio.value = res[i].content;
            qRadio.onclick = function() {
                displayCurrentQ()
            }

            qLabel.appendChild(qRadio);
            qLabel.appendChild(document.createTextNode(res[i].content));
            qDiv.appendChild(qLabel);

            fragment.appendChild(qDiv);
          }

          qList.appendChild(fragment);
        } else {
          qList.appendChild(document.createTextNode("※質問を追加してください"));
        }
      } else {
        console.log('response failed');
      }
    }
  }
  xhr.responseType = "json";
  xhr.send(null);
}

function ajaxPostQ() {
  var xhr = xhr_request("POST", "/q/reg", true);

  // TODO: refactoring
  var qParam = "q_user_id=" + encodeURIComponent(document.addform.q_user_id.value);
  qParam += "&content=" + encodeURIComponent(document.addform.content.value);
  xhr.send(qParam);

  xhr.onreadystatechange = function() {
    var addStatus = document.getElementById('add_status');
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        addStatus.classList.remove("text-danger");
        addStatus.classList.remove("text-muted");
        addStatus.classList.add("text-success");
        addStatus.innerHTML = "success!!";
        getQList();
        document.getElementById("q_text_area").value = '';
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
