type Store = {
  currentPage: number;
  feeds: NewsFeed[];
}

type News = {
  id: number;
  time_ago: string;
  title: string;
  url: string;
  user: string;
  content: string;
}

// inter section
type NewsFeed = News & {
  comments_count: number;
  points: number;
  read: boolean;
}

type NewsDetail = News & {
  comments: NewsComment[];
}

type NewsComment = News & {
  comments: NewsComment[];
  level: number;
}

const container: HTMLElement | null = document.getElementById('root')
const content = document.createElement('div')
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'

const store: Store = {
  currentPage: 1,
  feeds: [],
};

class api {
  url: string;
  ajax: XMLHttpRequest;

  constructor(url: string) {
    this.url = url;
    this.ajax = new XMLHttpRequest();
  }

  protected getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open('GET', this.url, false);
    this.ajax.send();
  
    return JSON.parse(this.ajax.response)
  }
}

class NewFeedApi extends api{
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewDetailApi extends api{
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

function makeFeed(feed: NewsFeed[]): NewsFeed[] {
  // 타입 추론 : i는 type을 지정해주지 않아도, 코드 상 문맥으로 number로 type이 지정됨.
  for (let i = 0; i< feed.length; i++)
  {
    feed[i].read = false;
  }
  return feed
}

function updateView(html: string): void {
  if (container) {
    container.innerHTML = html
  }
  else {
    console.error('최상위 컨테이너가 없어서 UI를 진행하지 못합니다.')
  }
}

function newsFeed(): void {
  let newsFeedData: NewsFeed[] = store.feeds
  const api = new NewFeedApi(NEWS_URL);

  if (newsFeedData.length === 0){
    newsFeedData = store.feeds = makeFeed(api.getData())
  }

  const newsList: string[] = []
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
    newsList.push(`_
      <div class="p-6 ${newsFeedData[i].read ? 'bg-red-200' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
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
  template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1))
  template = template.replace('{{__next_page__}}', String(bEndPage ? store.currentPage : store.currentPage + 1))

  updateView(template)
}

function newsDetail(): void {
  const id = location.hash.substr(7);
  const api = new NewDetailApi(CONTENT_URL.replace('@id', id));
  const newsContent = api.getData();
  
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
        {{__comments__}}
    </div>
  </div>
`;

template = template.replace('{{__comments__}}', makeComment(newsContent.comments))

for(let i=0; i < store.feeds.length; i++) {
  if (store.feeds[i].id === Number(id)) {
    store.feeds[i].read = true;
    break;
  }
}
  updateView(template)
}

function makeComment(comments: NewsComment[]): string {
  const commentString: string[] = [];

  for(let i = 0; i < comments.length; i++) {
    commentString.push(`
      <div style="padding-left: ${comments[i].level * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${comments[i].user}</strong> ${comments[i].time_ago}
        </div>
        <p class="text-gray-700">${comments[i].content}</p>
      </div>      
    `);

    if (comments[i].comments.length > 0) {
      commentString.push(makeComment(comments[i].comments));
    }
  }
  return commentString.join('');
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
