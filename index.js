import m from 'mithril';
import { div, button, br, pre } from './tags';

const view = Object.freeze({
    json: 'Json',
    edit: 'Edit',
    save: 'Save'
});

const use = (v, fn) => fn(v);
const when = (v, fn, or = undefined) => v ? fn(v) : or;

const addProp = vnode => {
    return {
        view: vnode => [
            button('Number'),
            button('Boolean'),
            button('String'),
            button('Object'),
            button('Array')
        ]
    }
}

const editor = vnode => {
    let selectedView = view.json;
    return {
        view({ attrs: { state, showToolbar = true } }) {
            return div.wrapper([
                showToolbar ? [
                    button.toolbar({ disabled: selectedView === view.edit, onclick: e => { selectedView = view.edit; } }, view.edit),
                    button.toolbar({ disabled: selectedView === view.json, onclick: e => { selectedView = view.json; } }, view.json),
                    br(),
                ] : null,
                when(
                    selectedView === view.json,
                    () => pre(JSON.stringify(state.object, null, 2)),
                    null
                ),
                when(
                    selectedView === view.edit,
                    () => m(addProp),
                    null
                )
            ]);
        }
    }
}


class JsonEditor extends HTMLElement {

    constructor() {
        super()
        this.root = this.attachShadow({
            mode: "open"
        });

        this.state = {
            object: {}
        };

        this.view = view.json;

        this.styleElement = document.createElement('style');
        this.root.appendChild(this.styleElement);

        this.updateStyle();

        this.wrapper = document.createElement('div');

        m.mount(this.wrapper, {
            view: vnode => {
                return m(editor, { state: this.state, onsave: o => this.onsave(o) });
            }
        });

        this.root.appendChild(this.wrapper);

    }

    connectedCallback() {
        this.object = when(
            this.getAttribute('data-initial'),
            v => JSON.parse(v.replace(/\'/ig, '"')),
            this.object
        );

        console.log('Json Editor added to page.');
        this.updateStyle(this);
    }

    disconnectedCallback() {
        console.log('Json Editor removed from page.');
    }

    adoptedCallback() {
        console.log('Json Editor moved to new page.');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log('Json Editor attributes changed.');
        this.updateStyle(this);
    }

    onsave() {
        const ev = new CustomEvent('save', { object: this.object });
        ev.target = this;
        this.dispatchEvent(ev);
    }

    get value() {
        return this.object;
    }

    updateStyle() {
            // Create some CSS to apply to the shadow dom
            this.styleElement.textContent = `
            .wrapper {
              background-color: ${this.view === view.json ? `#77ff94` : `#fa7f7a`};
              padding:15px;
              border-radius:10px;
            }
            button {
              background-color: #aaaaff;
              border: none;
              margin: 4px;
              padding: 3px 6px;
              border-radius:10px;
            }
          `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.object = when(
      this.getAttribute('data-initial'),
      v => JSON.parse(v.replace(/\'/ig, '"')),
      this.object
    );
    console.log('json-editor element attributes changed.');
  }
}

customElements.define("json-editor", JsonEditor);