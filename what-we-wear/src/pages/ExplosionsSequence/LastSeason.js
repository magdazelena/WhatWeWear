import React from 'react'

export default function LastSeason() {
  let timeline = gsap.timeline();
  timeline.to(this.references.lastSeasonTextRef.current, {
    duration: 0.2,
    onComplete: () => {
      this.setState({
        shouldAnimateSeason: true
      }, () => {
        animateComponentText(this.references.lastSeasonTextRef.current)
      })
    },
  });
  timeline.to(this.references.lastSeasonTextRef.current, {
    duration: 4,
    x: '-100%',
    onComplete: () => {
      scene.remove();

    }
  })
  return <AnimatedText
    id="lastSeason"
    ref={this.references.lastSeasonTextRef}
    animatedText={
      [{
        shouldAnimate: this.state.shouldAnimateSeason,
        text: "This is sooooooooooooooooooooooooooooooo last season..."
      }]
    }
  />
}