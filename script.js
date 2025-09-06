const newsContainer = document.getElementById("news-container");
const spinner = document.getElementById("spinner");
const bookmarkContainer = document.getElementById("bookmark-container");
const bookmarkCount = document.getElementById("bookmark-count");
let bookmarks = [];

const manageSpinner = (status) => {
    if (status) {
        spinner.classList.remove("hidden");
        newsContainer.classList.add("hidden");
    }
    else {
        spinner.classList.add("hidden");
        newsContainer.classList.remove("hidden");
    }
}

const loadCategories = async() => {
    try{
        const url = "https://news-api-fs.vercel.app/api/categories";
        const res = await fetch(url);
        const data = await res.json();
        showCategories(data.categories);
    }
    catch(error){
        alert("Error loading category");
    }
}

const showCategories = (categories) => {
    const categoryList = document.getElementById("category-list");
    categories.forEach(cat => {
        categoryList.innerHTML += `
            <li onclick="loadNewsByCategory('${cat.id}')" id="${cat.id}" class="cursor-pointer py-3 hover:border-b-4 hover:border-red-500">${cat.title}</li>
        `;
    });
    categoryList.innerHTML += `
            <li onclick="loadPopularNews()" id="popular" class="cursor-pointer py-3 hover:border-b-4 hover:border-red-500">সর্বাধিক পঠিত</li>
        `;
}

const loadPopularNews = async() => {
    manageSpinner(true);
    try{
        const url = `https://news-api-fs.vercel.app/api/popular`;
        const res = await fetch(url);
        const data = await res.json();
        showPopularNews(data.articles);
    }
    catch(error){
        showErrorMessage();
        manageSpinner(false);
    }
}

const showPopularNews = (articles) => {
    removeActive();
    document.getElementById("popular").classList.add("border-b-4", "border-red-500");
    newsContainer.innerHTML = "";
    articles.forEach(article => {
        newsContainer.innerHTML += `<div class="col-span-full py-2 flex items-center gap-6 border-b border-gray-300">
            <h2 class="font-bold text-4xl text-red-500">${article.rank}</h2>
            <h2 onclick="loadNewsDetail('${article.id}')" class="font-bold text-2xl cursor-pointer hover:underline">${article.title}</h2>
        </div>`;
    })
    manageSpinner(false);
}

const loadNewsByCategory = async(id) => {
    manageSpinner(true);
    try{
        const url = `https://news-api-fs.vercel.app/api/categories/${id}`;
        const res = await fetch(url);
        const data = await res.json();
        showNewsByCategory(data.articles, id);
    }
    catch(error){
        showErrorMessage();
        manageSpinner(false);
    }
}

const removeActive = () => {
    const allCategories = document.querySelectorAll("#category-list li");
    allCategories.forEach(cat => cat.classList.remove("border-b-4", "border-red-500"));
}

const showNewsByCategory = (articles, id) => {
    removeActive();
    const clickedCategory = document.getElementById(id);
    clickedCategory.classList.add("border-b-4", "border-red-500");
    if(articles.length === 0){
        showEmptyMessage();
    }
    else{
        newsContainer.innerHTML = "";
        articles.forEach(article => {
            newsContainer.innerHTML += `
                <div id="${article.id}" class="space-y-4">
                    <img src="${article.image.srcset[8].url}" alt="${article.image.alt}">
                    <h2 class="font-bold text-2xl">${article.title}</h2>
                    <p class="text-neutral-500">${article.time}</p>
                    ${article.description ? `<p>${article.description}</p>` : ""}
                    <button onclick="loadNewsDetail('${article.id}')" class="btn btn-block">বিস্তারিত পড়ুন</button>
                    <button class="btn btn-block">বুকমার্ক করুন</button>
                </div>
            `;
        });
    }
    manageSpinner(false);
}

const showErrorMessage = () => {
    newsContainer.innerHTML = `<h2 class="text-2xl font-bold text-center col-span-full">কিছু সমস্যা হয়েছে।</h2>`;
}

const showEmptyMessage = () => {
    newsContainer.innerHTML = `<h2 class="text-2xl font-bold text-center col-span-full">এই ক্যাটাগরিতে কোনো খবর পাওয়া যায় নি।</h2>`
}

const loadNewsDetail = async(id) => {
    const url = `https://news-api-fs.vercel.app/api/news/${id}`;
    const res = await fetch(url);
    const data = await res.json();
    showNewsDetail(data.article);
}

const showNewsDetail = (news) => {
    const newsModal = document.getElementById("news_modal");
    const newsDetail = document.getElementById("news-detail");
    newsModal.showModal();
    newsDetail.innerHTML = "";
    newsDetail.innerHTML += `
        ${news.images.length !== 0 ? `<img src="${news.images[0].url}" alt="" class="mx-auto">` : ''}
        <h2 class="font-bold text-2xl group-hover:underline">${news.title}</h2>
        <p class="text-neutral-500">${news.timestamp}</p>
    `;
    const contents = news.content;
    contents.forEach(content => {
        newsDetail.innerHTML += `<p>${content}</p>`;
    });
}

newsContainer.addEventListener("click", (e) => {
    if(e.target.innerText === "বুকমার্ক করুন"){
        handleBookMark(e);
    }
});

const handleBookMark = (e) => {
    const title = e.target.parentNode.children[1].innerText;
    const id = e.target.parentNode.id;
    let existingBookmark = bookmarks.find(bookmark => title === bookmark.title);
    if(existingBookmark){
        alert("Already added to bookmark");
        return;
    }
    else{
        bookmarks.push({
            id: id,
            title: title,
        });
    }
    showBookmarks(bookmarks);
}

const showBookmarks = (allBookmarks) => {
    bookmarkContainer.innerHTML = "";
    allBookmarks.forEach(bookmark => {
        bookmarkContainer.innerHTML += `
            <div class="border p-2 rounded-lg">
                <h4 onclick="loadNewsDetail('${bookmark.id}')" class="font-semibold cursor-pointer mb-2 hover:underline">${bookmark.title}</h4>
                <button onclick="deleteBookmark('${bookmark.id}')" type="button" class="btn bg-red-500 text-white rounded-lg">মুছে ফেলুন</button>
            </div>
        `;
    });
    bookmarkCount.innerText = bookmarks.length;
}

const deleteBookmark = (id) => {
    const filteredBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    bookmarks = filteredBookmarks;
    showBookmarks(bookmarks);
}

loadCategories();
loadNewsByCategory('main');