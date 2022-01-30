import React, { Component } from 'react';
import { TweenMax, Expo, TimelineMax } from 'gsap/all';
import ScrollMagic from 'scrollmagic';

import texts from '../dictionary/en.json';
import AnimatedText from './components/AnimatedText';
import NextButton from '../objects/NextButton.js';
class LoadingApp extends Component {

	constructor() {
		super();
		this.state = {
			loaded: false,
			counter: 0,
			animation: 0,
			animationInProgress: true
		}
		this.headingRef = null;
		this.headingTopRef = null;
		this.counterRef = null;
		this.progressBar = null;
		this.loader1Ref = null;
		this.loader2Ref = null;
		this.loader3Ref = null;
		this.scene1 = null;
		this.scene2 = null;
		this.scene3 = null;
	}

	promiseState = async state => new Promise(resolve => this.setState(state, resolve));

	componentDidMount() {
		window.onbeforeunload = function () {
			window.scrollTo(0, 0);
		}
		this.startAnimating();
		this.scene1 = new ScrollMagic.Scene({
			duration: 50
		})
			.on('leave', () => {
				this.setState({ animation: 4 })
				TweenMax.to(this.counterRef, 1, {
					fontSize: 200
				})
			})
			.on('enter', event => {
				if (event.scrollDirection === "REVERSE") {

					this.setState({
						counter: "710 000 000",
						animation: 1
					})
					TweenMax.to(this.counterRef, 1, {
						fontSize: 50
					})
				}

			})
		this.scene2 = new ScrollMagic.Scene({
			duration: 50,
			offset: 100
		})
			.on('enter', event => {
				if (event.scrollDirection === 'FORWARD') {
					this.setState({
						counter: "73%",
						animation: 2
					},


					)

				} else {
					//     this.setState({
					//         counter: "73%",
					//         animation : 2
					//     })
					//    TweenMax.to(this.counterRef, 1, {
					//        fontSize: 100
					//    })
				}
			})
			.on('leave', () => {

				TweenMax.to(this.counterRef, 1, {
					fontSize: 400
				})
			})
		this.scene3 = new ScrollMagic.Scene({
			duration: 50,
			offset: 200
		})
			.on('enter', event => {
				if (event.scrollDirection === 'FORWARD') {
					this.setState({
						counter: "1%",
						animation: 3
					});

				}
			})
		this.props.controller.addScene([this.scene1, this.scene2, this.scene3])

	}

	startAnimating() {
		let counter = { value: this.state.counter };
		let timeline = new TimelineMax();
		timeline.to(counter, 10, {
			value: 100,
			roundProps: 'value',
			ease: Expo.easeOut,
			onUpdate: function () {
				updateCounter(counter.value)
			}
		})
			.to(this.progressBar, 10, {
				width: "100vw",
				ease: Expo.easeOut
			}, "-=10")
			.to(this.counterRef, 6, {
				ease: Expo.easeOut,
				fontSize: 100
			}, "-=10")
			.to(counter, 6, {
				value: 710,
				roundProps: 'value',
				ease: Expo.easeIn,
				onUpdate: function () {
					updateCounter(counter.value)
				}
			})
			.to(this.progressBar, 6, {
				opacity: 0
			}, "-=6")
			.delay(2)
			.set(this.progressBar, {
				display: "none"
			})
			.to(counter, 1,
				{
					value: "710 000",
					onUpdate: function () {
						updateCounter("710 000")
					},
					onComplete: function () {
						nextAnimation();
					}
				})
			.to(this.counterRef, .5, {
				ease: Expo.easeOut,
				fontSize: '60px'
			}, '-=1')
			.delay(2)
			.to(counter, 1,
				{
					value: "710 000 000",
					onUpdate: function () {
						updateCounter("710 000 000")
					},
					onComplete: function () {
						toggleButton();
					}
				})
			.to(this.counterRef, .5, {
				ease: Expo.easeOut,
				fontSize: '50px'
			}, '-=1')


		var updateCounter = (value) => {
			this.setState({
				counter: value
			})
		}
		var nextAnimation = () => {
			this.setState(prevState => ({
				animation: prevState.animation + 1
			}))
		}
		var toggleButton = () => {
			this.setState(prevState => ({
				animationInProgress: !prevState.animationInProgress
			}))
		}
	}




	slideTextToPercent = () => {
		let textAnimation = new TimelineMax()
			.to(this.counterRef, 3, {
				ease: Expo.easeIn,
				marginLeft: "-90%"
			})
		return textAnimation;
	}
	nextButtonPressed = () => {
		switch (this.state.animation) {
			case 1:
				window.scrollTo(0, this.scene2.scrollOffset());
				break;
			case 2:
				window.scrollTo(0, this.scene3.scrollOffset());
				break;
			default:
				this.destroyIntro();
		}
	}
	// componentWillUnmount=()=>{
	//     this.props.controller.destroy();
	// }
	destroyIntro = () => {
		this.scene1.remove();
		this.scene2.remove();
		this.scene3.remove();
		this.props.markIntroDone();
	}
	render() {
		return <div>

			<div id="loadingPage">
				<div id="loadingSectionOne" className="loadingSection">
					<div className="introHeadline">
						<AnimatedText
							className="introHeadline"
							ref={e => this.headingTopRef = e}
							animatedText={[
								{
									shouldAnimate: this.state.animation === 1,
									text: texts.pageOne.headline
								},
								{
									shouldAnimate: this.state.animation === 2,
									text: texts.pageTwo.headline
								},
								{
									shouldAnimate: this.state.animation === 3,
									text: texts.pageThree.headline
								},
							]
							}
						/>
					</div>
					<div
						id="loader"
						ref={el => this.loader1Ref = el}
						className={this.state.counter <= 1 ? 'finished' : ''}
					>

						<div id="progressBar" >
							<span ref={e => this.progressBar = e}></span>
						</div>
						<span className="fullNumber" ref={element => { this.counterRef = element }}>         {this.state.counter}
						</span>

					</div>
					<div

						className="introText"
					>
						<AnimatedText
							ref={element => { this.headingRef = element }}
							shouldAnimate={this.state.animation === 1}
							text={texts.pageOne.description}
						/>
					</div>
				</div>
				<div id="loadingSectionTwo" className="loadingSection">
					<div

						className="introText"
					>
						<AnimatedText
							ref={element => { this.loader2Ref = element }}
							shouldAnimate={this.state.animation === 2}
							text={texts.pageTwo.description}
						/>
					</div>
				</div>
				<div id="loadingSectionThree" className="loadingSection">
					<div
						className="introText"
					>
						<AnimatedText
							ref={element => { this.loader3Ref = element }}
							shouldAnimate={this.state.animation === 3}
							text={texts.pageThree.description}
						/>
					</div>
				</div>
				{!this.state.animationInProgress && (<NextButton onClick={this.nextButtonPressed} />)}
			</div>
		</div>
	}
}

export default LoadingApp;