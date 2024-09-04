const container = document.getElementById('root')

const ajax = new XMLHttpRequest();
const content = document.createElement('div')
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response)
}

const newsFeed = getData(NEWS_URL)
const ul = document.createElement('ul')

window.addEventListener('hashchange', function() {
  // console.log(this.location.hash); 
  // 현재 location의 hash값을 console에 출력.
  const id = location.hash.substr(1);
  const newsContent = getData(CONTENT_URL.replace('@id', id))
  const title = this.document.createElement('h1')
  
  title.innerHTML = newsContent.title;
  content.appendChild(title)
})

for (let i = 0; i< 10; i++) 
{
  const div = document.createElement('div')
  div.innerHTML = `
  <li>
    <a href="#${newsFeed[i].id}">
      ${newsFeed[i].title} (${newsFeed[i].comments_count})
    </a>
  </li>
  `

  ul.appendChild(div.firstElementChild);
}

container.appendChild(ul)
container.appendChild(content)