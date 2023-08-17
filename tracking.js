elementsToTrack = ['input', 'a', 'button', 'textarea','select','canvas'];

function trackEvent(platformId, additionalTracking) {
    document.addEventListener('click', (event) => {
      additionalTracking.forEach(element => {
      this.elementsToTrack.push(element);
     });
        const clickedElem = event.target;
        //console.log(clickedElem);
        const tagName = clickedElem.tagName;
        if (this.elementsToTrack.indexOf((tagName.toLowerCase())) > -1) {
            const idValue = clickedElem.getAttribute('id');
            if (tagName == 'A') {
                this.saveEvent(clickedElem.tagName, 'href', clickedElem.getAttribute('href'), platformId,'click');
            }
            this.saveEvent(clickedElem.tagName, 'id', idValue, platformId,'click');
        }
    });

    document.addEventListener('change', (event) => {
        const changedElem = event.target;
        //console.log(changedElem);
        const tagName = changedElem.tagName;
        if (this.elementsToTrack.indexOf(tagName.toLowerCase()) > -1) {
            const idValue = changedElem.getAttribute('id');
            this.saveEvent(tagName, 'id', idValue, platformId,'change');

            if (tagName == 'INPUT') {
                if (changedElem.getAttribute('type') == 'password') {
                    this.saveEvent(changedElem.tagName, idValue, '***********', platformId,'change');
                }
                else if (changedElem.getAttribute('type') == 'checkbox') {
                    var input = document.getElementById(idValue ?? '');
                    this.saveEvent('checkbox', idValue, input.value, platformId,'change');
                }
                else {
                    var input = document.getElementById(idValue ?? '');
                    if (input != null && input != 'undefined') {
                        this.saveEvent(changedElem.tagName, idValue, input.value, platformId,'change');
                    }
                }
            }
        }
    });

    this.trackPageViews(platformId);

}

function saveEvent(elementType, attributeName, attributeValue, platformId,eventType) {
    console.log('elementType', elementType);
    console.log('attributeName', attributeName);
    console.log('attributeValue', attributeValue);
    console.log('platformId', platformId);
    console.log('visitorId', this.getVisitorId());
    console.log('sessionId', this.getSessionId());
    console.log('userId',this.getUserId());
    console.log('eventType',eventType);
    const userDetails=this.getOtherDetails();

    //call to microservice
    hitEventfunction(elementType,attributeName,attributeValue,platformId,eventType,
      userDetails.ipAddress,userDetails.isMobileDevice,userDetails.OS,userDetails.browser);
}

function getVisitorId() {
    if (localStorage.getItem('visitorId')) {
        return localStorage.getItem('visitorId');
    } else {
        var visitorId = this.generateGUID();
        localStorage.setItem('visitorId', visitorId);
        return visitorId;
    }
}

function getSessionId() {
    if (sessionStorage.getItem('sessionId')) {
        return sessionStorage.getItem('sessionId');
    } else {
        var sessionId = this.generateGUID();
        sessionStorage.setItem('sessionId', sessionId);
        return sessionId;
    }
}

function trackPageViews(platformId) {
    console.log('pageView', window.location.href);
    console.log('platformId', platformId);
    console.log('visitorId', this.getVisitorId());
    console.log('sessionId', this.getSessionId());
    const userDetails=this.getOtherDetails();
    hitPageViewfunction(platformId,window.location.href,userDetails.ipAddress,userDetails.isMobileDevice,userDetails.OS,userDetails.browser);
}
function generateGUID() {
    let result = "";
    for (let i = 0; i < 32; i++) {
        result += Math.floor(Math.random() * 16).toString(16);
        if (i === 7 || i === 11 || i === 15 || i === 19) {
            result += "-";
        }
    }
    return result;
}
function getUserId(){
    var userId=localStorage.getItem('userId');
    return userId;
}

function hitEventfunction(elementType,attributeName,attributeValue,platformId,eventType,ipaddress,isMobileDevice,OS,browser){
    const apiManagementEndpoint ='https://httptriggerfunctionapp.azurewebsites.net/api/SendEventFunction';
    const Event = {
        VisitorId: this.getVisitorId(),
        PlatformId: platformId,
        SessionId:this.getSessionId(),
        UserId:this.getUserId(),
        ElementType: elementType,
        AttributeName: attributeName,
        AttributeValue: attributeValue,
        TrackingTime: new Date(),
        EventType:eventType,
        IpAddress:ipaddress,
        IsMobile:isMobileDevice,
        OS:OS,
        Browser:browser

    };

fetch(apiManagementEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-functions-key': '9XZVJroHR8b0P9w5bV05jXgOK97luPUK6MA5Aske7sncAzFuSwwDqA=='
    },
    body:  JSON.stringify(Event)
})
.then(response => console.log("-----------------Event sent!----------------------",response))
.catch(error => console.error("----------------------------------------error to hit function-----------------------------------------",error));

}

function hitPageViewfunction(platformId,PageUrl,ipaddress,isMobileDevice,OS,browser){
    const apiManagementEndpoint ='https://httptriggerfunctionapp.azurewebsites.net/api/SendPageViewFunction';;
    const PageView = {
        VisitorId: this.getVisitorId(),
        PlatformId:platformId,
        SessionId:this.getSessionId(),
        UserId:this.getUserId(),
        PageUrl:PageUrl,
        TrackingTime: (new Date()).toString(),
        IpAddress:ipaddress,
        IsMobile:isMobileDevice,
        OS:OS,
        Browser:browser
    }

fetch(apiManagementEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-functions-key': 'NR1iMT4Jge6BIA524CtVTohgFrW8f_xI0y_ytfymSFPUAzFuWszVFA=='
    },
    body: JSON.stringify(PageView)
})
.then(response => console.log("-----------------Page view sent!----------------------",response))
.catch(error => console.error("----------------------------------------error to Page view function-----------------------------------------",error));

}

function getOtherDetails(){
var userAgent=window.navigator.userAgent;
console.log('userAgent',userAgent);
var isMobileDevice=false;
if (navigator.userAgent.match(/Android/i)
|| navigator.userAgent.match(/webOS/i)
|| navigator.userAgent.match(/iPhone/i)
|| navigator.userAgent.match(/iPad/i)
|| navigator.userAgent.match(/iPod/i)
|| navigator.userAgent.match(/BlackBerry/i)
|| navigator.userAgent.match(/Windows Phone/i)) {
  isMobileDevice = true ;
} else {
  isMobileDevice = false ;
}
console.log('is mobile device',isMobileDevice);
console.log('OS',navigator.platform);
var details={
  isMobile:isMobileDevice,
  browser:userAgent,
  OS:navigator.platform,
}
//Get IP address
 fetch('https://api.ipify.org/?format=json')
  .then(response => response.json())
  .then(data => {
  const ipAddress = data.ip;
  details.ipAddress=ipAddress
})
  .catch(error => console.error(error));
  console.log(details);
  return details;

 

}
