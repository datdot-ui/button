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
	:root {
			--b: 0, 0%;
			--r: 100%, 50%;
			--color-black: var(--b), 0%;
			--color-greyF2: var(--b), 95%;
			--size16: 1.6rem;
			--weight300: 300;
			--primary-color: var(--color-black);
			--primary-bg-color: var(--color-greyF2);
			--primary-size: var(--size16);
	}
	:host(i-button) {
			--size: var(--primary-size);
			--weight: var(--weight300);
			--color: var(--primary-color);
			--color-focus: var(--primary-color-focus);
			--bg-color: var(--primary-bg-color);
			--bg-color-focus: var(--primary-bg-color-focus);
			--opacity: 1;
			--padding: 12px;
			--margin: 0;
			--border-width: 0px;
			--border-style: solid;
			--border-color: var(--primary-color);
			--border-opacity: 1;
			--border: var(--border-width) var(--border-style) hsla(var(--border-color), var(--border-opacity));
			--border-radius: var(--primary-radius);
			--offset_x: 0px;
			--offset-y: 6px;
			--blur: 30px;
			--shadow-color: var(--primary-color);
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
			--shadow-opacity: 0;
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