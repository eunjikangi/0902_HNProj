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

function newsFeed() {
  const newsFeedData = getData(NEWS_URL)
  const newsList = []

  newsList.push('<ul>')
  for (let i = 0; i< 10; i++) 
  {
    newsList.push(`
    <li>
      <a href="#${newsFeedData[i].id}">
        ${newsFeedData[i].title} (${newsFeedData[i].comments_count})
      </a> 
    </li>
    `)
  }
  newsList.push('</ul>')

  // join : 배열 안 문자열들을 하나의 문자열로 합쳐서 return해줌.
  container.innerHTML = newsList.join('')
}

function newsDetail() {
  const id = location.hash.substr(1);
  const newsContent = getData(CONTENT_URL.replace('@id', id))
  
  container.innerHTML = `
    <h1>${newsContent.title}</h1>
    <div>
      <a href="#">목록으로</a>
     </div>
  `
}

function router() {
  const routePath = location.hash;

  if (routePath == '') {
    newsFeed()
  }
  else {
    newsDetail()
  }
}

window.addEventListener('hashchange', router)

newsFeed();