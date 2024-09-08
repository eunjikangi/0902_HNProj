const container = document.getElementById('root')

const ajax = new XMLHttpRequest();
const content = document.createElement('div')
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'

const store = {
  currentPage: 1,
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response)
}

function newsFeed() {
  const newsFeedData = getData(NEWS_URL)
  const newsList = []
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a 
              href="#/page/{{__prev_page__}}" 
              class="text-gray-500">
                Previous
              </a>
              <a 
              href="#/page/{{__next_page__}}" 
              class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}        
      </div>
    </div>
  `;

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) 
  {
    newsList.push(`
      <div class="p-6 ${newsFeedData[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeedData[i].id}">${newsFeedData[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeedData[i].comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeedData[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeedData[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeedData[i].time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
  }

  let bEndPage = false
  if (newsFeedData[store.currentPage * 10] == undefined)
    {
      bEndPage = true
    }

  template = template.replace('{{__news_feed__}}', newsList.join(''))
  template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1)
  template = template.replace('{{__next_page__}}', bEndPage ? store.currentPage : store.currentPage + 1)

  container.innerHTML = template
}

function newsDetail() {
  console.log('newsDetail')

  const id = location.hash.substr(7);
  const newsContent = getData(CONTENT_URL.replace('@id', id))
  
  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/${store.currentPage}" class="text-gray-500">
              Back
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="h-full border rounded-xl bg-white m-6 p-4 ">
      <h2>${newsContent.title}</h2>
      <div class="text-gray-400 h-20">
        ${newsContent.content}
      </div>
    </div>
  </div>
`;

  container.innerHTML = template
}

function router() {
  const routePath = location.hash;

  if (routePath == '') {
    newsFeed()
    console.log('Init')
  }
  else if (routePath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routePath.substr(7));
    newsFeed()
  }
  else {
    newsDetail()
  }
}

window.addEventListener('hashchange', router)

newsFeed();
console.log('초기화')
