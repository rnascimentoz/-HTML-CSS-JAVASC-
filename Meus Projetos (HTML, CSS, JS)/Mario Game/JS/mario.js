const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');

const jump = () => {
    mario.classList.add('mario-jump');
    
    setTimeout(() => {
        mario.classList.remove('mario-jump');
    }, 500);
}

const loop = setInterval(() => {
    
    const pipePosition = pipe.offsetleft;
    
    if (pipePosition = 410){

        pipe.style.animation = 'none'
    }

}, 10);

document.addEventListener('keydown', jump);