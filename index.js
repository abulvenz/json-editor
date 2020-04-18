const view = Object.freeze({
    json: 'Json',
    edit: 'Edit',
    save: 'Save'
});

const use = (v, fn) => fn(v);
const when = (v, fn, or = undefined) => v ? fn(v) : or;

class JsonEditor extends HTMLElement {

    constructor() {
        super()
        console.log('Hello world')
        this.root = this.attachShadow({
            mode: "open"
        });

        this.state = {
            object: {}
        };

        this.view = view.json;

        const wrapper = this.wrapper = document.createElement('div');
        wrapper.className = 'wrapper';
        this.root.appendChild(wrapper);

        this.styleElement = document.createElement('style');
        this.root.appendChild(this.styleElement);

        this.updateStyle();
    }

    connectedCallback() {

        this.render();
        this.object = when(
            this.getAttribute('data-initial'),
            v => JSON.parse(v.replace(/\'/ig, '"')),
            this.object
        );

        console.log(this.object)

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
        this.getAttribute('onsave');
    }

    updateStyle() {
            // Create some CSS to apply to the shadow dom
            this.styleElement.textContent = `
            .wrapper {
              background-color: ${this.view === view.json ? `#77ff94` : `#fa7f7a`};
              padding:15px;
              border-radius:10px;
            }
          `;
    this.object = {};
  }


  render() {
    this.updateStyle();
    console.log('rendering');
    this.wrapper.innerHTML = `
    <div>
      <button id="json" ${this.view === view.json ? 'disabled' : ''}>${view.json}</button>
      <button id="edit" ${this.view === view.edit ? 'disabled' : ''}>${view.edit}</button>
      ${this.view === view.edit ? `<button id="save">${view.save}</button>` : ''}      
      <br />
      ${
      this.view === view.json ? `
        <pre>${JSON.stringify(this.object, null, 2)}</pre>
  `: ''
      }
    </div> 
  `;
    console.log('Adding eventlisteners')
    this.root.querySelector('#json').addEventListener('click', e => {
      this.view = view.json;
      this.render();
    });
    this.root.querySelector('#edit').addEventListener('click', e => {
      this.view = view.edit;
      this.render();
    });
    if (this.root.querySelector('#save'))
      this.root.querySelector('#save').addEventListener('click', e => {
        this.view = view.json;
        this.render();
        this.onsave();
      });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.object = when(
      this.getAttribute('data-initial'),
      v => JSON.parse(v.replace(/\'/ig, '"')),
      this.object
    );
    console.log('json-editor element attributes changed.');
    this.render();
  }
}

class JsonObjectEditor extends HTMLElement {

  connectedCallback() {
    console.log('Json Object Editor added to page.');
  }

  disconnectedCallback() {
    console.log('Json Object Editor removed from page.');
  }

  adoptedCallback() {
    console.log('Json Object Editor moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('Json Object Editor attributes changed.');
  }
}

customElements.define("json-object", JsonObjectEditor);
customElements.define("json-editor", JsonEditor);