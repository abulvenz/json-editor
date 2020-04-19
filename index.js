import m from 'mithril';
import { div, button, br, pre, input, fieldset, legend, span } from './tags';

const view = Object.freeze({
    json: 'Json',
    edit: 'Edit',
    save: 'Save',
    nice: 'Nice'
});

const use = (v, fn) => fn(v);
const when = (v, fn, or = undefined) => v ? fn(v) : or;

const types = Object.freeze({
    number: 'Number',
    boolean: 'Boolean',
    string: 'String',
    object: 'Object',
    null: 'null',
    array: 'Array',
});

const renderInput = vnode => {
    return {
        view: ({ attrs: { type } }) => {
            console.log(type)
            switch (type) {
                case "number":
                    return input({ type: 'number' })
            }
        }
    };
};

const addProp = vnode => {
    let collapsed = true;
    let type = null;
    const select = (type_, object) => {
        type = type_;
    };
    const clear = () => {
        type = null;
        collapsed = true;
    };
    return {
        view: ({ attrs: { state: object } }) =>
            collapsed ? button({
                onclick: () => collapsed = false
            }, '+') : [
                fieldset(
                    legend(
                        input({ placeHolder: 'name' })),
                    type ?
                    m(renderInput, { type }) :
                    Object.keys(types).map(type => button({ onclick: e => select(type, object) }, types[type]))
                )
            ]
    };
};

const renderObject = vnode => {
    return {
        view: ({ attrs: { state } }) => {
            const view_ = state.view;
            console.log(view_)
            return state.object === undefined ? 'undefined' :
                state.object === null ? 'null' :
                typeof state.object === 'string' ? state.object :
                typeof state.object === 'number' ? state.object :
                Array.isArray(state.object) ? [
                    div.array(
                        state.object.map(element =>
                            span.element(m(renderObject, {
                                state: { view: view_, object: element }
                            }))
                        )
                    ),
                    view_ !== view.nice ? m(addProp) : null
                ] :
                typeof state.object === 'object' ? div.object(
                    [
                        Object.keys(state.object).map(prop =>
                            fieldset(
                                legend(prop),
                                m(renderObject, {
                                    state: { view: view_, object: state.object[prop] }
                                })
                            )
                        ),
                        view_ !== view.nice ? m(addProp) : null
                    ]) :
                JSON.stringify(state.object, null, 2);
        }
    };
};

const editor = vnode => {
    return {
        view({ attrs: { onsave, state, showToolbar = true } }) {
            console.log(state)
            return div.wrapper([
                showToolbar ? [
                    button.toolbar({ disabled: state.view === view.edit, onclick: e => { state.view = view.edit; } }, view.edit),
                    button.toolbar({ disabled: state.view === view.json, onclick: e => { state.view = view.json; } }, view.json),
                    button.toolbar({ disabled: state.view === view.nice, onclick: e => { state.view = view.nice; } }, view.nice),
                    state.view === view.edit ? button({ onclick: e => onsave(state.object) }, view.save) : null,
                    br(),
                ] : null,
                when(
                    state.view === view.json,
                    () => pre(JSON.stringify(state.object, null, 2)),
                    null
                ),
                when(
                    state.view === view.edit || state.view === view.nice,
                    () => m(renderObject, { state }),
                    null
                )
            ]);
        }
    };
};

class JsonEditor extends HTMLElement {

    constructor() {
        super()
        this.root = this.attachShadow({
            mode: "open"
        });

        this.state = {
            object: {},
            view: view.nice
        };

        this.styleElement = document.createElement('style');
        this.root.appendChild(this.styleElement);

        this.updateStyle();

        this.wrapper = document.createElement('div');

        m.mount(this.wrapper, {
            view: vnode => {
                return m(editor, { showToolbar: this.state.controls, state: this.state, onsave: o => this.onsave(o) });
            }
        });

        this.root.appendChild(this.wrapper);

    }

    connectedCallback() {
        this.state.object = when(
            this.getAttribute('data-initial'),
            v => JSON.parse(v.replace(/\'/ig, '"')),
            this.state.object
        );
        this.state.controls = when(this.getAttribute('show-controls') !== null,
            () => true,
            false
        );
        when(this.getAttribute('data-url'), url => {
            fetch(url)
                .then(response => response.json())
                .then(o => {
                    this.state.object = o;
                    m.redraw();
                })
        });
        m.redraw();
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
        //   ev.target = this;
        this.dispatchEvent(ev);
    }

    get value() {
        return this.object;
    }

    updateStyle() {
            // Create some CSS to apply to the shadow dom
            this.styleElement.textContent = `
            .wrapper {
              background-color: ${this.view === view.json ? `#77ff94` : `hsla(133, 100%, 53%, 0.562)`};
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
            .array {
              background-color: #aaaaff;
              border-radius: 10px;
            }
            .element {              
              padding: 3px;
              margin: 3px;
            }
            .object{
              margin-left: 1px;
              padding:1px;
              background-color: hsla(133, 100%, 33%, 0.562);
              border: 1px solid hsla(133, 100%, 73%, 0.562);
              box-shadow: 10px 10px 5px hsla(133, 100%, 13%, 0.562);     
              border-radius: 10px;
            }
            fieldset {
              -webkit-border-radius: 8px;
              -moz-border-radius: 8px;
              border-radius: 8px;      
              margin-bottom: 5px;   
              margin-left:0px;     
            }
            legend {
              border-radius: 8px;      
              background-color: salmon;
              padding:3px;
            }
          `;
  }

  // attributeChangedCallback(name, oldValue, newValue) {
  //   this.state.object = when(
  //     this.getAttribute('data-initial'),
  //     v => JSON.parse(v.replace(/\'/ig, '"')),
  //     this.state.object
  //   );
  //   m.redraw();
  //   console.log('json-editor element attributes changed.');
  // }
}

customElements.define("json-editor", JsonEditor);