import gsap from "gsap";

/**
 * Animates the text element with the given `ref` based on the given `progress`
 * value from 0 to 1.
 *
 * The animation is a radial gradient that transitions from pink to yellow
 * and from navy to pink.
 *
 * @param {React.RefObject<HTMLDivElement>} ref The reference to the text element
 * @param {number} normalizedProgress A value between 0 and 1 indicating the progress of the animation
 */
export const animateText = (ref, normalizedProgress) => {
    // Interpolates from pink → yellow and navy → pink
    const color1 = gsap.utils.interpolate("rgb(233, 66, 119)", "rgb(255, 211, 125)", normalizedProgress);
    const color2 = gsap.utils.interpolate("rgb(32, 31, 66)", "rgb(233, 66, 119)", normalizedProgress);
    // Interpolates from 1 → 0.9
    const scale = gsap.utils.interpolate(1, 0.9, normalizedProgress);

    ref.current.style.backgroundClip = 'text';
    gsap.set(ref.current, {
        backgroundImage: `radial-gradient(circle at 50% ${100 - normalizedProgress * 100}%, ${color1} 0%, ${color2} 70%)`,
        scale: scale,
    });
}


/**
 * Animates the radial gradient mask for the given `ref` based on the given
 * `progress` value from 0 to 1.
 *
 * @param {React.RefObject<HTMLDivElement>} ref The reference to the element with the radial gradient mask
 * @param {number} progress A value between 0 and 1 indicating the progress of the animation
 * @param {number} normalizedProgress A value between 0 and 1 indicating the normalized progress of the animation
 * @param {number} startPos The starting position of the gradient
 * @param {number} endPos The ending position of the gradient
 */
export const radialReveal = (ref,
                             progress,
                             normalizedProgress,
                             startPos,
                             endPos) => {

    const gradientPos = gsap.utils.interpolate(startPos, endPos, normalizedProgress);
    gsap.set(ref.current, {
        maskImage: `radial-gradient(circle at 50% ${gradientPos}%, #000 70%, transparent 80%)`,
    });

};