const createStoryItemTemplate = (story) => `
  <article class="story-item">
    <div class="story-item__header">
      <img class="story-item__header__poster" src="${story.photoUrl}" 
           alt="Story image from ${story.name}" crossorigin="anonymous">
      <div class="story-item__header__info">
        <h3 class="story-item__title">
          <a href="#/detail/${story.id}" class="story-item__title__link">${
  story.name
}</a>
        </h3>
        <p class="story-item__date"><i class="fa-regular fa-calendar"></i> ${new Date(
          story.createdAt
        ).toLocaleDateString()}</p>
      </div>
    </div>
    <div class="story-item__content">
      <p class="story-item__description">${story.description.substring(
        0,
        150
      )}${story.description.length > 150 ? "..." : ""}</p>
    </div>
    <div class="story-item__footer">
      <a href="#/detail/${
        story.id
      }" class="story-item__read-more"><i class="fa-solid fa-book-open"></i> Read More</a>
    </div>
  </article>
`;

const createStoryDetailTemplate = (story) => `
  <div class="story-detail">
    <h3 class="story-detail__title">${story.name}</h3>
    <p class="story-detail__date"><i class="fa-regular fa-calendar"></i> Posted on ${new Date(
      story.createdAt
    ).toLocaleDateString()}</p>
    
    <div class="story-detail__image">
      <img src="${story.photoUrl}" alt="Story image from ${
  story.name
}" crossorigin="anonymous">
    </div>
    
    <div class="story-detail__content">
      <p class="story-detail__description">${story.description}</p>
    </div>
    
    ${
      story.lat && story.lon
        ? `<div class="story-detail__location">
            <p><i class="fa-solid fa-location-dot"></i> Location: ${story.lat.toFixed(
              6
            )}, ${story.lon.toFixed(6)}</p>
          </div>`
        : `<p class="story-detail__no-location"><i class="fa-solid fa-map-pin"></i> No location data available</p>`
    }
    
    <div class="story-detail__back">
      <a href="#/home"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
    </div>
  </div>
`;

export { createStoryItemTemplate, createStoryDetailTemplate };
