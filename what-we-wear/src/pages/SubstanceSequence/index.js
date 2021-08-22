import React, { Component, useEffect, useRef, useState } from 'react';
import ScrollMagic from 'scrollmagic';
import { TimelineMax, TweenLite } from 'gsap';
import texts from 'dictionary/en.json';
import { animateText, generateTextForAnimation } from 'helpers/textAnimations';
import ScrollDown from 'objects/ScrollDown';
import NextButton from 'objects/NextButton';
const SubstanceSequence = (props) => {
	const { renderer, nextScene, onUnmount } = props
	let refs = {
		buttonRef: useRef(),
		headlineRef: useRef(),
		descRef: useRef(),
		desc2Ref: useRef(),
		desc3Ref: useRef(),
		videoRef: useRef(),
		sequenceRef: useRef()
	}
	const [shouldAnimate, setShouldAnimate] = useState(false)
	const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)
	const [shouldAnimateDesc2, setShouldAnimateDesc2] = useState(false)
	const [shouldAnimateDesc3, setShouldAnimateDesc3] = useState(false)
	const tl = new TimelineMax()
	const [counter, setCounter] = useState(1)

	useEffect(() => {
		createVideoTexture()
		return () => {
			refs = {}
			onUnmount()
		}
	})
	useEffect(() => {
		if (shouldAnimate) [...refs.headlineRef.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [shouldAnimate])

	useEffect(() => {
		if (shouldAnimateDesc) [...refs.descRef.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [shouldAnimateDesc])
	useEffect(() => {
		if (shouldAnimateDesc2) [...refs.desc2Ref.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [shouldAnimateDesc2])
	useEffect(() => {
		if (shouldAnimateDesc3) [...refs.desc3Ref.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [shouldAnimateDesc3])
	const animateTexts = function () {
		tl.to('video', {
			duration: .5,
			opacity: .2
		})
		tl.to(refs.headlineRef.current, {
			duration: .3,
			onComplete: () => {
				setShouldAnimate(true)
			}
		})
		tl.to(refs.descRef.current, {
			duration: 1,
			onComplete: () => {
				setShouldAnimateDesc(true)
			}
		})
		tl.to(refs.desc2Ref.current, {
			duration: 1,
			onComplete: () => {
				setShouldAnimateDesc2(true)
			}
		})
		tl.to(refs.desc3Ref.current, {
			duration: 1,
			onComplete: () => {
				setShouldAnimateDesc3(true)
			}
		})
	}

	const createVideoTexture = () => {
		const video = refs.videoRef.current;
		if (!video) return;
		video.currentTime = 1;
		video.mute = true;
		video.play();
		video.addEventListener('ended', () => {
			TweenLite.to(refs.buttonRef.current, 1, {
				opacity: 1
			})
			animateTexts();
			video.loop = true;
			video.play();
		})

	}

	return <div>
		<div id="substanceSection" ref={refs.sequenceRef}>
			<video src="images/cotton3_.mp4" id="video" ref={refs.videoRef}></video>
			<div id="substanceHeadline" ref={refs.headlineRef}>
				{shouldAnimate && (generateTextForAnimation(texts.substanceSequence.headline.split('')))}
			</div>
			<div id="substanceDesc" ref={refs.descRef}>
				{shouldAnimateDesc && (generateTextForAnimation(texts.substanceSequence.description.split('')))}
			</div>
			<div id="substanceDesc2" ref={refs.desc2Ref}>
				{shouldAnimateDesc2 && (generateTextForAnimation(texts.substanceSequence.description2.split('')))}
			</div>
			<div id="substanceDesc3" ref={refs.desc3Ref}>
				{shouldAnimateDesc3 && (generateTextForAnimation(texts.substanceSequence.description3.split('')))}
			</div>
			<div ref={refs.buttonRef} className="show-up">
				<NextButton onClick={nextScene} />
			</div>
		</div>
	</div>

}
export default SubstanceSequence;