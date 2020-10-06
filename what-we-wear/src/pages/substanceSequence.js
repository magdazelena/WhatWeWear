import React, { Component } from 'react';
import ScrollMagic from 'scrollmagic';
import { TimelineMax, TweenLite } from 'gsap';
import texts from '../dictionary/en.json';
import { animateText, generateTextForAnimation } from '../helpers/textAnimations';
import ScrollDown from '../objects/ScrollDown';
class SubstanceSequence extends Component {
	constructor(props) {
		super();
		this.state = {
			videoRef: null,
			sequenceRef: null,
			shouldAnimate: false,
			shouldAnimateDesc: false,
			shouldAnimateDesc2: false,
			shouldAnimateDesc3: false,
			shouldAnimateSeason: false,
			counter: 1
		}
	}
	componentDidMount = () => {
		this.buttonRef = React.createRef();
		this.headlineRef = React.createRef();
		this.descRef = React.createRef();
		this.desc2Ref = React.createRef();
		this.desc3Ref = React.createRef();
		this.tl = new TimelineMax();
		this._isMounted = true;
	}
	componentWillUnmount = () => {
		this._isMounted = false;
	}
	onVideoUpload = node => {
		this.setState({
			videoRef: node
		},
			() => {
				this.onScroll();
			}
		)
	}
	onSequenceLoad = node => {
		this.setState({
			sequenceRef: node
		},
			() => {
				this.createVideoTexture();
			}
		)
	}
	animateTexts = function () {
		this.tl.to('video', .5, {
			opacity: .2
		})
		this.tl.to(this.headlineRef, .3, {
			onComplete: () => {
				this.setState({
					shouldAnimate: true
				}, () => {
					[...this.headlineRef.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).play();
					});
				})
			}
		})
		this.tl.to(this.descRef, 1, {
			onComplete: () => {
				this.setState({
					shouldAnimateDesc: true
				}, () => {
					[...this.descRef.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).play();
					});
				})
			}
		})
		this.tl.to(this.desc2Ref, 1, {
			onComplete: () => {
				this.setState({
					shouldAnimateDesc2: true
				}, () => {
					[...this.desc2Ref.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).play();
					});
				})
			}
		})
		this.tl.to(this.desc3Ref, 1, {
			onComplete: () => {
				this.setState({
					shouldAnimateDesc3: true
				}, () => {
					[...this.desc3Ref.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).play();
					});
				})
			}
		})
	}
	onScroll = () => {
		let scene = new ScrollMagic.Scene({
			duration: "60%",
			triggerElement: this.state.sequenceRef
		})
			.on('leave', e => {
				if (e.scrollDirection === "FORWARD") {
					this.props.nextScene();

				} else {
					this.props.prevScene();
				}
				scene.remove();

			})
			.addTo(this.props.controller);
	}


	createVideoTexture = () => {
		const video = this.state.videoRef;
		if (!video) return;
		video.currentTime = 1;
		video.mute = true;
		this.video = video;
		this.video.play();
		this.video.addEventListener('ended', () => {
			TweenLite.to(this.buttonRef, 1, {
				opacity: 1
			})
			this.animateTexts();
			video.loop = true;
			video.play();
		})

	}

	render = () => {
		return <div>
			<div id="substanceSection" ref={this.onSequenceLoad}>
				<video src="../images/cotton3_.mp4" id="video" ref={this.onVideoUpload}></video>
				<div id="substanceHeadline" ref={ref => { this.headlineRef = ref }}>
					{this.state.shouldAnimate && (generateTextForAnimation(texts.substanceSequence.headline.split('')))}
				</div>
				<div id="substanceDesc" ref={ref => { this.descRef = ref }}>
					{this.state.shouldAnimateDesc && (generateTextForAnimation(texts.substanceSequence.description.split('')))}
				</div>
				<div id="substanceDesc2" ref={ref => { this.desc2Ref = ref }}>
					{this.state.shouldAnimateDesc2 && (generateTextForAnimation(texts.substanceSequence.description2.split('')))}
				</div>
				<div id="substanceDesc3" ref={ref => { this.desc3Ref = ref }}>
					{this.state.shouldAnimateDesc3 && (generateTextForAnimation(texts.substanceSequence.description3.split('')))}
				</div>
				<div ref={ref => this.buttonRef = ref} className="show-up">
					<ScrollDown />
				</div>
			</div>
		</div>
	}
}
export default SubstanceSequence;