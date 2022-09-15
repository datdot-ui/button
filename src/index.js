const protocol_maker = require('protocol-maker')
const get_svg = require('get_svg')

var id = 0
var icon_count = 0
const sheet = new CSSStyleSheet()
const default_opts = { 
	name: 'i-button',
	text: '',
	icons: [],
	status: {
		current: false, 
		disabled: false,
	},
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)

module.exports = button

button.help = () => { return { opts: default_opts } }

function button (opts, parent_wire) {
	const {
		name = default_opts.name, 
		text = default_opts.text, 
		icons = default_opts.icons, 
		status: {
			current = default_opts.status.current,
			disabled = default_opts.status.disabled,
		} = {},
		theme = `` } = opts		
	
	const current_state =  { opts: { name, text,	icons, status: { disabled, current }, sheets: [default_opts.theme, theme] } }

	// protocol
	const initial_contacts = { 'parent': parent_wire }
	const contacts = protocol_maker('button', listen, initial_contacts)

	function listen (msg) {
			const { head, refs, type, data, meta } = msg // receive msg
			const [from, to, msg_id] = head
			if (type === 'help') {
				const $from = contacts.by_address[from]
				$from.notify($from.make({ to: $from.address, type: 'help', data: { state: get_current_state() }, refs: { cause: head }}))                         
			}
			if (type === 'update') handle_update(data)
	}

	// make button
	const el = document.createElement('i-button')
	const shadow = el.attachShadow({mode: 'closed'})

	let text_field = document.createElement('span')
	text_field.className = 'text'

	var svgs = icons.map(icon => {
		const path = icon.path || './src/svg'
		return get_svg(`${path}/${icon.name}.svg`)
	})
	svgs.forEach(svg => shadow.append(svg))
	
	if (text) {
			text_field.innerText = text
			shadow.append(text_field)
	}

	if (disabled) el.setAttribute(`aria-disabled`, true)
	if (current) el.setAttribute(`aria-current`, true)

	if (!disabled) el.onclick = handle_click
	el.setAttribute('aria-label', name)
	el.setAttribute('tabindex', 0) // indicates that its element can be focused, and where it participates in sequential keyboard navigation 

	const custom_theme = new CSSStyleSheet()
	custom_theme.replaceSync(theme)
	shadow.adoptedStyleSheets = [sheet, custom_theme]

	return el

	// helpers
	function handle_update (data) {
		const { text, icons = [], sheets } = data
		if (icons.length) {
			current_state.opts.icons = icons
			svgs.forEach(icon => { shadow.removeChild(icon) })
			svgs = icons.map(icon => {
				const path = icon.path || './src/svg'
				return get_svg(`${path}/${icon.name}.svg`)
			})
			svgs.forEach(svg => shadow.append(svg))
		}
		if (text && typeof text === 'string') {
			current_state.opts.text = text
			text_field.innerText = text
			if (shadow.contains(text_field)) shadow.removeChild(text_field)
			shadow.append(text_field)
		}
		if (sheets) {
			const new_sheets = sheets.map(sheet => {
				if (typeof sheet === 'string') {
					current_state.opts.sheets.push(sheet)
					const new_sheet = new CSSStyleSheet()
					new_sheet.replaceSync(sheet)
					return new_sheet
				} 
				if (typeof sheet === 'number') return shadow.adoptedStyleSheets[sheet]
			})
			shadow.adoptedStyleSheets = new_sheets
		}
	}
	// button click
	function handle_click () {
			const $parent = contacts.by_name['parent'] // { notify, make, address }
			$parent.notify($parent.make({ to: $parent.address, type: 'click' }))
	}
	// get current state
	function get_current_state () {
		return  {
			opts: current_state.opts,
			contacts
		}
	}

}

function get_theme () {
	return `
	:host(i-button) {
		--b: 0, 0%;
    --r: 100%, 50%;
    --color-white: var(--b), 100%;
    --color-black: var(--b), 0%;
    --color-dark: 223, 13%, 20%;
    --color-deep-black: 222, 18%, 11%;
    --color-red: 358, 99%, 53%;
    --color-amaranth-pink: 329, 100%, 65%;
    --color-persian-rose: 323, 100%, 50%;
    --color-orange: 32, var(--r);
    --color-light-orange: 36, 100%, 55%;
    --color-safety-orange: 27, 100%, 50%;
    --color-deep-saffron: 31, 100%, 56%;
    --color-ultra-red: 348, 96%, 71%;
    --color-flame: 15, 80%, 50%;
    --color-verdigris: 180, 54%, 43%;
    --color-viridian-green: 180, 100%, 63%;
    --color-blue: 214, 100%, 49%;
    --color-heavy-blue: 233, var(--r);
    --color-maya-blue: 205, 96%, 72%;
    --color-slate-blue: 248, 56%, 59%;
    --color-blue-jeans: 204, 96%, 61%;
    --color-dodger-blue: 213, 90%, 59%;
    --color-light-green: 97, 86%, 77%;
    --color-lime-green: 127, 100%, 40%;
    --color-slimy-green: 108, 100%, 28%;
    --color-maximum-blue-green: 180, 54%, 51%;
    --color-deep-green: 136, 79%, 22%;
    --color-green: 136, 82%, 38%;
    --color-lincoln-green: 97, 100%, 18%;
    --color-yellow: 44, 100%, 55%;
    --color-chrome-yellow: 39, var(--r);
    --color-bright-yellow-crayola: 35, 100%, 58%;
    --color-green-yellow-crayola: 51, 100%, 83%;
    --color-purple: 283, var(--r);
    --color-heliotrope: 288, 100%, 73%;
    --color-medium-purple: 269, 100%, 70%;
    --color-electric-violet: 276, 98%, 48%;
    --color-grey33: var(--b), 20%;
    --color-grey66: var(--b), 40%;
    --color-grey70: var(--b), 44%;
    --color-grey88: var(--b), 53%;
    --color-greyA2: var(--b), 64%;
    --color-greyC3: var(--b), 76%;
    --color-greyCB: var(--b), 80%;
    --color-greyD8: var(--b), 85%;
    --color-greyD9: var(--b), 85%;
    --color-greyE2: var(--b), 89%;
    --color-greyEB: var(--b), 92%;
    --color-greyED: var(--b), 93%;
    --color-greyEF: var(--b), 94%;
    --color-greyF2: var(--b), 95%;
    --transparent: transparent;
    /* define font ---------------------------------------------*/
    --snippet-font: Segoe UI Mono, Monospace, Cascadia Mono, Courier New, ui-monospace, Liberation Mono, Menlo, Monaco, Consolas;
    --size12: 1.2rem;
    --size13: 1.3rem;
    --size14: 1.4rem;
    --size15: 1.5rem;
    --size16: 1.6rem;
    --size18: 1.8rem;
    --size20: 2rem;
    --size22: 2.2rem;
    --size24: 2.4rem;
    --size26: 2.6rem;
    --size28: 2.8rem;
    --size30: 3rem;
    --size32: 3.2rem;
    --size34: 3.4rem;
    --size36: 3.6rem;
    --size38: 3.8rem;
    --size40: 4rem;
    --size42: 4.2rem;
    --size44: 4.4rem;
    --size46: 4.6rem;
    --size48: 4.8rem;
    --size50: 5rem;
    --size52: 5.2rem;
    --size54: 5.4rem;
    --size56: 5.6rem;
    --size58: 5.8rem;
    --size60: 6rem;
    --weight100: 100;
    --weight300: 300;
    --weight400: 400;
    --weight600: 600;
    --weight800: 800;
    /* define primary ---------------------------------------------*/
    --primary-body-bg-color: var(--color-greyF2);
    --primary-font: Arial, sens-serif;
    --primary-size: var(--size14);
    --primary-size-hover: var(--primary-size);
    --primary-weight: 300;
    --primary-weight-hover: 300;
    --primary-color: var(--color-black);
    --primary-color-hover: var(--color-white);
    --primary-color-focus: var(--color-orange);
    --primary-bg-color: var(--color-white);
    --primary-bg-color-hover: var(--color-black);
    --primary-bg-color-focus: var(--color-greyA2), 0.5;
    --primary-border-width: 1px;
    --primary-border-style: solid;
    --primary-border-color: var(--color-black);
    --primary-border-opacity: 1;
    --primary-radius: 8px;
    --primary-avatar-width: 100%;
    --primary-avatar-height: auto;
    --primary-avatar-radius: 0;
    --primary-disabled-size: var(--primary-size);
    --primary-disabled-color: var(--color-greyA2);
    --primary-disabled-bg-color: var(--color-greyEB);
    --primary-disabled-icon-size: var(--primary-icon-size);
    --primary-disabled-icon-fill: var(--color-greyA2);
    --primary-listbox-option-icon-size: 20px;
    --primary-listbox-option-avatar-width: 40px;
    --primary-listbox-option-avatar-height: auto;
    --primary-listbox-option-avatar-radius: var(--primary-avatar-radius);
    --primary-option-avatar-width: 30px;
    --primary-option-avatar-height: auto;
    --primary-list-avatar-width: 30px;
    --primary-list-avatar-height: auto;
    --primary-list-avatar-radius: var(--primary-avatar-radius);
    /* define icon settings ---------------------------------------------*/
    --primary-icon-size: var(--size16);
    --primary-icon-size-hover: var(--size16);
    --primary-icon-fill: var(--primary-color);
    --primary-icon-fill-hover: var(--primary-color-hover);
		--size: var(--primary-size);
		--weight: var(--weight300);
		--color: var(--primary-color);
		--color-focus: var(--primary-color-focus);
		--bg-color: var(--primary-bg-color);
		--bg-color-focus: var(--primary-bg-color-focus);
		--border-color: var(--primary-color);
		--border-radius: var(--primary-radius);
		--shadow-color: var(--primary-color);
		--opacity: 1;
		--padding: 12px;
		--margin: 0;
		--border-width: 0px;
		--border-style: solid;
		--border-opacity: 1;
		--border: var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity));
		--offset_x: 0px;
		--offset-y: 6px;
		--blur: 30px;
		--shadow-opacity: 0;
		--box-shadow: var(--offset_x) var(--offset-y) var(--blur) hsla( var(--shadow-color), var(--shadow-opacity) );
		display: inline-grid;
		grid-auto-flow: column;
		gap: 5px;
		justify: content-center;
		align: items-center;
		width: var(--width);
		height: var(--height);
		max-width: 100%;
		font-size: var(--size);
		font-weight: var(--weight);
		color: hsl( var(--color) );
		background-color: hsla( var(--bg-color), var(--opacity) );
		border: var(--border);
		border-radius: var(--border-radius);
		box-shadow: var(--box-shadow);
		padding: var(--padding);
		transition: font-size .3s, font-weight .15s, color .3s, background-color .3s, opacity .3s, border .3s, box-shadow .3s ease-in-out;
		cursor: pointer;
		-webkit-mask-image: -webkit-radial-gradient(white, black);
	}
	:host(i-button:hover) {
			--size: var(--primary-size-hover);
			--weight: var(--primary-weight-hover);
			--color: var(--primary-color-hover);
			--bg-color: var(--primary-bg-color-hover);
			--border-color: var(--primary-color-hover);
			--offset-x: 0;
			--offset-y: 0;
			--blur: 50px;
			--shadow-color: var(--primary-color-hover);
	}
	:host(i-button:hover:focus:active) {
			--bg-color: var(--primary-bg-color);
	}
	:host(i-button:focus) {
			--color: var(--color-focus);
			--bg-color: var(--bg-color-focus);
			background-color: hsla(var(--bg-color));
	}
	:host(i-button) g {
			--icon-fill: var(--primary-icon-fill);
			fill: hsl(var(--icon-fill));
			transition: fill 0.05s ease-in-out;
	}
	:host(i-button:hover) g {
		--icon-fill: var(--primary-icon-fill-hover);
	}
	:host(i-button[aria-disabled="true"]) .icon, 
	:host(i-button[aria-disabled="true"]:hover) .icon,
	:host(i-button[aria-current="true"]), :host(i-button[aria-current="true"]:hover) {
			--size: var(--current-size);
			--weight: var(--current-weight);
			--color: var(--current-color);
			--bg-color: var(--current-bg-color);
	}
	:host(i-button[aria-current="true"]) .icon,  
	:host(i-button[aria-current="true"]:hover) .icon {
			--icon-size: var(--current-icon-size);
	}
	:host(i-button[aria-current="true"]) g {
			--icon-fill: var(--current-icon-fill);
	}
	:host(i-button[aria-current="true"]:focus) {
			--color: var(--color-focus);
			--bg-color: var(--bg-color-focus);
	}
	:host(i-button[aria-disabled="true"]), :host(i-button[aria-disabled="true"]:hover) {
			--size: var(--primary-disabled-size);
			--color: var(--primary-disabled-color);
			--bg-color: var(--primary-disabled-bg-color);
			cursor: not-allowed;
	}
	:host(i-button[disabled]) g, 
	:host(i-button[disabled]:hover) g, 
	:host(i-button) .text {
			
	}
	:host(i-button) .icon {
			--icon-size: var(--primary-icon-size);
			display: block;
			width: var(--icon-size);
			transition: width 0.25s ease-in-out;
	}
	:host(i-button:hover) .icon {
			--icon-size: var(--primary-icon-size-hover);
	}
	`
}