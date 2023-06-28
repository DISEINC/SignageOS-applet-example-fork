
require('./index.css');

import sos from '@signageos/front-applet';
function SelectionLogic(playlist = []) {
	let index = 0;
	this.Take = () => {
		if (index >= playlist.length)
		index = 0;
		
		return playlist[index++];
	};
}
  
function Scenario(name, selectionLogic) {
	this.name = name;
	this.selectionLogic = selectionLogic;
  
	let _currentPlaylistItem = null;
	let _nextPlaylistItem = null;
  
	this.prepare = async () => {
		console.log('scenario prepare', name);
  
		 _nextPlaylistItem = new PlaylistItem(selectionLogic.Take());
  
		return _nextPlaylistItem.prepare();
	};
	
	this.start = async () => {
		console.log('scenario start', name);
  
		this.gotoNextPlaylistItem();
	};
  
	// Errors
	// Timeouts
  
	this.gotoNextPlaylistItem = async () => {
		console.log('scenario next PlaylistItem', name);
  
		// wait for prepare
		let repeatPlaylistItem = false;
		let previousItem = null;
		if (_currentPlaylistItem) {
			repeatPlaylistItem = _nextPlaylistItem.content == _currentPlaylistItem.content;
			if (!repeatPlaylistItem) {
				previousItem = _currentPlaylistItem;
			}
		}
		_currentPlaylistItem = _nextPlaylistItem;
		_nextPlaylistItem = null;
  
		_currentPlaylistItem.start(this.gotoNextPlaylistItem, previousItem);

		setTimeout(() => {
			console.log('prepare next PlaylistItem');
		
			const nextItem = selectionLogic.Take();
			_nextPlaylistItem = new PlaylistItem(nextItem);
			if (_currentPlaylistItem.content == nextItem.content) {
				_nextPlaylistItem = _currentPlaylistItem;
			}
			else {
				_nextPlaylistItem.prepare();
			}
		}, 500);
	};
  
	this.stop = () => {
		console.log('scenario stop', name);
		if (_currentPlaylistItem) _currentPlaylistItem.stop();
		if (_nextPlaylistItem) _nextPlaylistItem.stop();
	};
};
  
function PlaylistItem({ name, content }) {
	this.name = name;
	this.content = content;
  
	this.prepare = async () => {
		console.log('PlaylistItem prepare', name);
		console.log('PlaylistItemComponent prepare', this.name);  
		const div = document.getElementById('output');
		if (content.uid.match(/\.mp4$/)) {
			await sos.video.prepare(...content.arguments, {
				background: true
			});
			this.videoTag = true;
		}
		else if (content.uid.match(/^http/)) {
			this.iframeTag = document.createElement('iframe');    
			this.iframeTag.src = content.uri;
			this.tag = this.iframeTag;
			this.tag.style.visibility = "hidden";
			div.appendChild(this.tag);
		}    
		else {
			this.imageTag = document.createElement('img');    
			this.imageTag.src = content.uri;
			this.tag = this.imageTag;
			this.tag.style.visibility = "hidden";
			div.appendChild(this.tag);
		}		
	};
  
	this.start = async (next, previousItem) => {
		console.log('PlaylistItem start', this.name);
		if (this.tag) {
			this.tag.style.visibility = "inherit";
		}
		
		if (this.videoTag) {
			await sos.video.play(...content.arguments);
			if (previousItem) {
				previousItem.stop();
			}
			await sos.video.onceEnded(...content.arguments); 

			next();
		}
		if (this.imageTag) {	
			if (previousItem) {
				previousItem.stop();
			}		
			this.nextTimeout = setTimeout(next, 2500);
		}
		if (this.iframeTag) {
			if (previousItem) {
				previousItem.stop();
			}
			this.nextTimeout = setTimeout(next, 10000);
		}     
	};

	this.stop = async () => {
		console.log('sceneComponent stop', this.name);
		const div = document.getElementById('output');
		if (this.tag) {
			this.tag.style.visibility = "hidden";
			div.removeChild(this.tag);  			
		}  
  		if (this.videoTag) {			
			await sos.video.stop(...content.arguments);
			this.videoTag = null;
		}
		if (this.imageTag) {
			this.imageTag = null;
			clearTimeout(this.nextTimeout);
		}
		if (this.iframeTag) {
			this.iframeTag = null;
			clearTimeout(this.nextTimeout);
		}    
  
		this.tag = null;
	};  
};

// Wait on sos data are ready (https://sdk.docs.signageos.io/api/js/content/latest/js-applet-basics)
sos.onReady().then(async function () {
	let videosToDownload = [
		{
			uid: 'dise-video-FHD-landscape-4.mp4',
			uri: 'https://beta.diseserver.net/content/43/8A/1a572592b6b72358c0b3c4a9ab6eb4a963e16d81.mp4'
		},
		{
			uid: 'dise-video-4K-landscape-5.mp4',
			uri: 'https://beta.diseserver.net/content/58/AF/9b5679341c4b938bb7f6bd21a5fb12f7807c3d46.mp4'
		},
		{
			uid: 'dise-video-4K-25fps-portrait-3.mp4',
			uri: 'https://beta.diseserver.net/content/5A/E7/df53f0502047e770ab87251094fc26c1d7c018a4.mp4'
		},
		{
			uid: 'dise-video-4k-25fps-portrait-4.mp4',
			uri: 'https://beta.diseserver.net/content/2C/1A/af801ec8dd70e024f378479c8af68e1edad25bb7.mp4'
		},
		{
			uid: 'dise-video-FHD-25fps-portrait-3.mp4',
			uri: 'https://beta.diseserver.net/content/A4/DC/fd0866bec41db4d43286f42703899594b007921e.mp4'
		},
		{
			uid: 'dise-video-FHD-25fps-portrait-4.mp4',
			uri: 'https://beta.diseserver.net/content/E3/CD/ecfdc7ebc9fb5cc76cbfadae332c8a3d81465521.mp4'
		},
		{
			uid: 'dise-image-FHD-portrait-3.jpg',
			uri: 'https://beta.diseserver.net/content/32/0A/b682e70ec33c055b85b5ec2f3a0e91ee110c6047.jpg'
		},
		{
			uid: 'dise-image-FHD-portrait-4.jpg',
			uri: 'https://beta.diseserver.net/content/27/93/4580c9472ce1d160f22bc00c8291ef7ba363b24a.jpg'
		},
		{
			uid: 'dise-video-FHD-landscape-4.mp4',
			uri: 'https://beta.diseserver.net/content/43/8A/1a572592b6b72358c0b3c4a9ab6eb4a963e16d81.mp4'
		},
		{
			uid: 'dise-video-4K-landscape-5.mp4',
			uri: 'https://beta.diseserver.net/content/58/AF/9b5679341c4b938bb7f6bd21a5fb12f7807c3d46.mp4'
		},
		
	];

	
	// Store video to offline storage (https://sdk.docs.signageos.io/api/js/content/latest/js-offline-cache-media-files)
	videosToDownload = await Promise.all(
		videosToDownload.map(async (video) => {
			const {
				filePath
			} = await sos.offline.cache.loadOrSaveFile(video.uid, video.uri);
			video.arguments = [filePath, 0,0, 1920, 1080]
			return video;
		})
	);

	const Scenario1 = new SelectionLogic([
		{name: 'scene2', content: videosToDownload[2]},
		{name: 'scene5', content: videosToDownload[2]},
		{name: 'scene3', content: videosToDownload[3]},
		{name: 'scene4', content: videosToDownload[4]},
		{name: 'scene6', content: { uid: 'http', uri: 'https://www.dise.com'}},
	]);

	const Scenario2 = new SelectionLogic([
		{name: 'scene1', content: videosToDownload[1]},
		{name: 'scene1', content: videosToDownload[6]},
		{name: 'scene1', content: videosToDownload[1]},
		{name: 'scene1', content: videosToDownload[6]},
		{name: 'scene1', content: videosToDownload[1]},

	]);

	const Scenario3 = new SelectionLogic([
		{name: 'scene1', content: videosToDownload[4]},
		{name: 'scene2', content: videosToDownload[4]},
		{name: 'scene3', content: videosToDownload[5]},
		{name: 'scene4', content: { uid: 'http', uri: 'https://www.dise.com'}},
		{name: 'scene5', content: { uid: 'http', uri: 'https://www.dise.com'}},
		{name: 'scene6', content: { uid: 'http', uri: 'https://www.grassfish.com/'}},
	]);


	const TC1 = new Scenario('TC1 - FHD video transition', Scenario1);
	const TC2 = new Scenario('TC2 - 4k video transition', Scenario2);
	const TC3 = new Scenario('TC3 - Image and web page transition', Scenario3);

	async function test(s) {
	    if (s == 1) {
			await TC1.prepare();
			await TC1.start();  
	  	}
	
	  	if (s == 2) {
			await TC2.prepare();
			await TC2.start();  
	  	}
	
	  	if (s == 3) {
			await TC3.prepare();
			await TC3.start();  
	  	}
	}
	
// Uncomment the test case you want to run	
//	setTimeout(()=>{test(1)},5000);
  setTimeout(()=>{test(2)},2000);
//	setTimeout(()=>{test(3)},5000);	
	
});
