const CLIENT_ID='305785842646-0ktlb26c792v51ersl7b9gtalp2k5iqe.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
  ];
  const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
  
  const authorizeButton = document.getElementById('authorize-button');
  const signoutButton = document.getElementById('signout-button');
  const content =document.getElementById('content');
  const channelForm =document.getElementById('channel-form');
  const channelInput=document.getElementById('channel-name');
  const videoContainer =document.getElementById('video-container');

  const defaultchannel='googledevelopers';

  //form submit and change channel
channelForm.addEventListener('submit',e=>{
    e.preventDefault();

    const channel=channelInput.value;
    getChannel(channel);
})
// load auth2 library 
function handleClientLoad(){
    gapi.load('client:auth2',initClient)
}
// Init API client library and set up sign in listners
function initClient(){
    gapi.client.init({
        discoveryDocs:DISCOVERY_DOCS,
        client_id:CLIENT_ID,
        scope:SCOPES
    }).then(()=>{
    //  listen for sign in state change 
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // handle initial sign in state
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick=handleAuthClick;
    signoutButton.onclick=handleSignoutClick;
    })
}
// update UI in sign in state changes
function updateSigninStatus(isSignedIn){
    if(isSignedIn){
    authorizeButton.style.display='none';
    signoutButton.style.display='block';
    content.style.display='block';
    videoContainer.style.display='block';
    getChannel(defaultchannel);

    }else{
        authorizeButton.style.display='block';
        signoutButton.style.display='none';
        content.style.display='none';
        videoContainer.style.display='none';
    }
}
// handle sign in 
function handleAuthClick(){
    gapi.auth2.getAuthInstance().signIn();
}
// handle sign out
function handleSignoutClick(){
    gapi.auth2.getAuthInstance().signOut();
}
//display channel data
function showChannelData(data) {
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
  }
// get channel from API 
function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: 'snippet,contentDetails,statistics',
      forUsername: channel
    })
    .then(response => {
    console.log(response);
    const channel = response.result.items[0];

    const output = `
    <ul class="collection">
      <li class="collection-item">Title: ${channel.snippet.title}</li>
      <li class="collection-item">ID: ${channel.id}</li>
      <li class="collection-item">Suscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
      <li class="collection-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
      <li class="collection-item">Videos:${numberWithCommas(channel.statistics.videoCount)}</li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
    `;
    showChannelData(output);

    const playlistId = channel.contentDetails.relatedPlaylists.uploads;
    requestVideoPlaylist(playlistId);
    })
    // .catch(err => alert('No Channel By That Name'));
}
//Adding commas to numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function requestVideoPlaylist(playlistId){
    const requestOptions={
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 12
    };

    const request= gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response=>{
        console.log(response);
        const playlistItems = response.result.items;
        if(playlistItems){
        let output = '<h4 class="center-align">Latest Videos</h4>'

        //Loop through videos and append output
         playlistItems.forEach(item => {
             const videoId = item.snippet.resourceId.videoId;
             output += `<div class ="col s3">
             <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
             </div>
             `;
         });
         
        // Output Videos
        videoContainer.innerHTML = output; 
        }
        else{
            videoContainer.innerHTML= "No Uploaded Videos";
        }
    });
}
