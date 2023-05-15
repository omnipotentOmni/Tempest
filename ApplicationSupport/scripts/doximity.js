// const toolTipContainer = document.getElementsByClassName('tooltip')[0];

const toolTipSource = Object.keys(toolTipContainer.dataset);

console.log(toolTipSource);
const toolTip = document.createElement('div');
toolTip.classList = 'tool-tip-window';
toolTip.textContent = 'HelloWorld';

toolTipContainer.style.position = 'relative';

toolTipContainer.appendChild(toolTip);

let timeoutId;

toolTipContainer.addEventListener('mouseenter', () => {
  timeourId = setTimeout(() => {
    toolTip.classList.add('tool-tip-open');
  }, 500);
});

toolTipContainer.addEventListener('mouseleave', () => {
  clearTimeout(timeoutId);
  toolTip.classList.remove('tool-tip-open');
})