const view = Object.freeze({
    json: 'json',
    edit: 'edit'
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

        this.view = view.json;

        this.addCSS();


    }

    addCSS() {
        // Create some CSS to apply to the shadow dom
        const style = document.createElement('style');
        console.log(style.isConnected);

        style.textContent = `
            .wrapper {
              background-color: #77ff94;
              padding:15px;
              border-radius:10px;
            }
          `;
        this.root.appendChild(style);
        this.object = {};
    }

    template() {
            return `
        <div>
          <button>JSON</button>
          <button>Edit</button>
          <br />
          ${
      this.view === view.json ? `
            <pre>${JSON.stringify(this.object, null, 2)}</pre>
      `: ''
      }
        </div> 
      `
  }

  onsave() {

  }



  connectedCallback() {
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    this.object = when(
      this.getAttribute('data-initial'),
      v => JSON.parse(v.replace(/\'/ig, '"')),
      this.object
    );

    wrapper.innerHTML = this.template();
    console.log(this.object)

    this.root.appendChild(wrapper);
  }

}

customElements.define("json-editor", JsonEditor);