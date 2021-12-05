export function onMount(scope, $iframe) {
//!!это из-за Сафари, такое чувство, что после начала загрузки она инициализирует новый виндов и тем самым сбрасывает установленный DOMContentLoaded
	load(scope, $iframe, $iframe.contentDocument.readyState);
//, поуму должно роальтоать так:
//	$iframe.contentWindow.addEventListener(`DOMContentLoaded`, () => {
//		onLoad(scope, $iframe);
//	});
	$iframe.src = scope.url;
}
function load(scope, $iframe, state) {
	if ($iframe.contentDocument.readyState === state) {
		setTimeout(() => load(scope, $iframe, state), 0);
		return;
	}
	if ($iframe.contentDocument.readyState === `interactive` || $iframe.contentDocument.readyState === `complete`) {
		onLoad(scope, $iframe);
		return;
	}
	$iframe.contentWindow.addEventListener(`DOMContentLoaded`, () => onLoad(scope, $iframe));
}
export function onLoad(scope, $iframe) {
	scope.code = prepareCode($iframe.contentDocument.body.innerHTML);
	let sync = 0
	$iframe.contentDocument.documentElement.addEventListener("render", function(evt) {
		const s = ++sync;
		setTimeout(() => {
			if (s === sync) {
				resize($iframe);
			}
		}, 100);
	});
}
export function onInput($cnt, $iframe) {//, fillingOff, s) {
	for (const sync of $iframe.contentWindow.mw_syncInRender) {
		$iframe.contentWindow.mw_cancelSync(sync, 8);
	}
//	await $iframe.contentWindow.mw_getCurRender();
	const $body = $iframe.contentDocument.body;
	for (let $i = $body.firstChild; $i !== null; $i = $body.firstChild) {
		$iframe.contentWindow.mw_removeChild($i);
	}
	$body.innerHTML = $cnt.textContent;
	for (let $i = $body.firstChild; $i !== null; $i = $i.nextSibling) {
//		if ($i.nodeType === 1) {
			$iframe.contentWindow.mw_preRender($i);
//		}
	}
	$iframe.style.height = "";
	$iframe.contentWindow.mw_render(undefined, 0);
}
function prepareCode(code) {
	return code.trim().replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}
function resize($iframe) {
	if ($iframe.contentDocument === null || $iframe.style.maxHeight) {
		return;
	}
//	if (!$iframe.style.maxHeight) {
		$iframe.style.overflow = "hidden";
		$iframe.contentDocument.documentElement.style.overflow = "hidden";
//	}
	$iframe.style.height = $iframe.contentDocument.scrollingElement.scrollHeight + "px";
}
export function onKeyDown($e, evt) {
	const val = $e.textContent,
		pos = self.getSelection().focusOffset;
	if (evt.key === "Tab") {
		evt.preventDefault();
		const newPos = pos + 1;
		$e.textContent = val.substr(0, pos) + "\t" + val.substr(pos);
		setSelectionRange($e, newPos, newPos);
		return;
	}
	if (evt.key !== "Enter") {
		return;
	}
	const toSpaceVal = val.substr(0, pos);
	let spaceBeginIdx = 0,
		spaceCount = 0;
	for (let i = toSpaceVal.length - 1; i > -1; i--) {
		if (toSpaceVal[i - 1] !== "\n" && i !== 0) {
			continue;
		}
		spaceBeginIdx = i;
		const toSpaceValLen = toSpaceVal.length;
		for (; i < toSpaceValLen; i++) {
			const c = toSpaceVal[i]
			if (c !== " " && c !== "\t") {
				break;
			}
			spaceCount++;
		}
		break;
	}
//	if (spaceCount === 0) {
//		return;
//	}
	evt.preventDefault();
	const newPos = pos + spaceCount + 1;
	$e.textContent = val.substr(0, pos) + "\n" + val.substr(spaceBeginIdx, spaceCount) + val.substr(pos);
	setSelectionRange($e, newPos, newPos);
}
function setSelectionRange($e, begin, end) {
	const range = document.createRange(),
		sel = window.getSelection();
	sel.removeAllRanges();
	if (begin <= end) {
		range.setStart($e.firstChild, begin);
		range.setEnd($e.firstChild, end);
	} else {
		range.setStart($e.firstChild, end);
		range.setEnd($e.firstChild, begin);
	}
	sel.addRange(range);
}
