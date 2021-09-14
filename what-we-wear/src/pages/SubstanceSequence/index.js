import React, { useEffect, useRef, useState } from 'react';
import { TimelineMax, TweenLite } from 'gsap';
import texts from 'dictionary/en.json';
import NextButton from 'objects/NextButton';
import TextElement from 'pages/components/textElement';
const SubstanceSequence = (props) => {
	const { nextScene, onUnmount } = props
	let refs = {
		buttonRef: useRef(),
		headlineRef: useRef(),
		desc3Ref: useRef(),
		videoRef: useRef(),
		sequenceRef: useRef()
	}
	const [shouldAnimate, setShouldAnimate] = useState(false)
	const [shouldAnimateDesc3, setShouldAnimateDesc3] = useState(false)
	const tl = new TimelineMax()
	let _isMounted = false
	useEffect(() => {
		createVideoTexture()
		_isMounted = true
		return () => {
			refs = {}
			onUnmount()
			_isMounted = false
		}
	})

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
		tl.to(refs.desc3Ref.current, {
			duration: 1,
			delay: 5,
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
				{shouldAnimate && <TextElement text={texts.substanceSequence.headline} />}
			</div>

			<div id="substanceDesc3" ref={refs.desc3Ref}>
				{shouldAnimateDesc3 && <TextElement text={texts.substanceSequence.description3} />}
			</div>
			<div ref={refs.buttonRef} className="show-up">
				<NextButton onClick={nextScene} />
			</div>
		</div>
	</div>

}
export default SubstanceSequence;