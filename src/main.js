import './style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import {
  dbPromise,
  getAllSurveys,
  deleteSurvey,
  saveSurvey
} from './db.js'

// ========================================
// SURVEY EVIDENCE
// ========================================




// =====================================================
// VKU FIELD SURVEY
// Main Application
// =====================================================

const app = document.querySelector('#app')

let selectedSurvey = null
let currentPhoto = null
let currentLocation = null


// =====================================================
// HELPERS
// =====================================================

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}


function formatDate(value) {
  if (!value) return 'Unknown date'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}


function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}


function conditionClass(condition) {
  const value = String(condition || '').toLowerCase()

  if (value.includes('good')) return 'good'
  if (value.includes('fair')) return 'fair'
  if (value.includes('poor')) return 'poor'

  return ''
}


function statusClass(status) {
  return String(status || '').toLowerCase() === 'synced'
    ? 'synced'
    : 'pending'
}


// =====================================================
// COMMON HEADER
// =====================================================

function renderHeader(title, back = true) {
  return `
    <header class="vku-header">

      <div class="vku-header-left">

        ${
          back
            ? `
              <button
                class="vku-header-button"
                id="back-button"
                aria-label="Back"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
            `
            : ''
        }

        <h1>${escapeHtml(title)}</h1>

      </div>

      <div class="vku-header-logo">
        <img
          src="/pwa-192x192.png"
          alt="VKU"
        />
      </div>

    </header>
  `
}


// =====================================================
// BOTTOM NAVIGATION
// =====================================================

function renderBottomNav(active = 'home') {
  return `
    <nav class="vku-bottom-nav">

      <button
        class="vku-nav-item ${active === 'home' ? 'active' : ''}"
        data-nav="home"
      >
        <i class="fa-solid fa-house"></i>
        <span>Home</span>
      </button>

      <button
        class="vku-nav-item ${active === 'surveys' ? 'active' : ''}"
        data-nav="surveys"
      >
        <i class="fa-solid fa-list-check"></i>
        <span>Surveys</span>
      </button>

      <button
        class="vku-nav-item ${active === 'sync' ? 'active' : ''}"
        data-nav="sync"
      >
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <span>Sync</span>
      </button>

      <button
        class="vku-nav-item ${active === 'settings' ? 'active' : ''}"
        data-nav="settings"
      >
        <i class="fa-solid fa-gear"></i>
        <span>Settings</span>
      </button>

    </nav>
  `
}


function bindBottomNav() {

  document
    .querySelectorAll('[data-nav]')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          const destination =
            button.dataset.nav

          if (destination === 'home') {
            renderHome()
          }

          if (destination === 'surveys') {
            renderMySurveys()
          }

          if (destination === 'sync') {
            renderSyncStatus()
          }

          if (destination === 'settings') {
            renderSettings()
          }

        }
      )

    })

}


// =====================================================
// SPLASH SCREEN
// =====================================================

function renderSplash() {

  app.innerHTML = `

    <div class="splash-screen">

      <div class="splash-content">

        <div class="splash-logo">
          <img
            src="/pwa-192x192.png"
            alt="VKU Field Survey"
          />
        </div>

        <h1>
          VKU
        </h1>

        <h2>
          FIELD SURVEY
        </h2>

        <div class="splash-campus">
          <i class="fa-solid fa-building"></i>
          <i class="fa-solid fa-location-dot"></i>
        </div>

        <p>
          Inspect. Record. Improve.
        </p>

        <div class="splash-line"></div>

        <span>
          A better campus<br />
          starts with you.
        </span>

      </div>

      <div class="splash-loader">
        <span></span>
      </div>

    </div>

  `

  setTimeout(
    renderHome,
    1200
  )
}


// =====================================================
// HOME
// =====================================================

async function renderHome() {

  try {

    const surveys =
      await getAllSurveys()

    const total =
      surveys.length

    const pending =
      surveys.filter(
        survey =>
          survey.status !== 'Synced'
      ).length

    const synced =
      surveys.filter(
        survey =>
          survey.status === 'Synced'
      ).length


    const recent =
      surveys
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 3)


    app.innerHTML = `

      <div class="vku-page home-page">

        <!-- HEADER -->

        <header class="home-header">

          <div class="home-brand">

            <div class="home-brand-logo">
              <img
                src="/pwa-192x192.png"
                alt="VKU"
              />
            </div>

            <div>

              <strong>
                VKU Field Survey
              </strong>

              <span>
                Inspect today for a better tomorrow
              </span>

            </div>

          </div>


          <button
            class="home-menu-button"
            id="open-menu"
            aria-label="Open menu"
          >
            <i class="fa-solid fa-bars"></i>
          </button>

        </header>


        <!-- GREETING -->

        <section class="home-intro">

          <p>
            Hello, Duy! 👋
          </p>

          <h1>
            Let's make<br />
            VKU better!
          </h1>

          <span>
            Inspect and record campus facilities
            quickly and easily.
          </span>

        </section>


        <!-- STATISTICS -->

        <section class="home-statistics">

          <article class="home-stat total">

            <strong>
              ${total}
            </strong>

            <span>
              Total Surveys
            </span>

          </article>


          <article class="home-stat pending">

            <strong>
              ${pending}
            </strong>

            <span>
              Pending
            </span>

          </article>


          <article class="home-stat synced">

            <strong>
              ${synced}
            </strong>

            <span>
              Synced
            </span>

          </article>

        </section>


        <!-- NEW SURVEY -->

        <button
          class="home-primary-action"
          id="new-survey"
        >

          <span>
            <i class="fa-solid fa-plus"></i>
            New Survey
          </span>

          <i
            class="fa-solid fa-arrow-right"
          ></i>

        </button>


        <!-- QUICK ACTIONS -->

        <section class="home-actions">

          <button
            class="home-action-card"
            id="home-surveys"
          >

            <div class="home-action-icon red">
              <i class="fa-solid fa-list-check"></i>
            </div>

            <div>

              <strong>
                My Surveys
              </strong>

              <span>
                View and manage your surveys
              </span>

            </div>

            <i
              class="fa-solid fa-chevron-right"
            ></i>

          </button>


          <button
            class="home-action-card"
            id="home-sync"
          >

            <div class="home-action-icon blue">
              <i class="fa-solid fa-cloud"></i>
            </div>

            <div>

              <strong>
                Sync Status
              </strong>

              <span>
                Check your offline data
              </span>

            </div>

            <i
              class="fa-solid fa-chevron-right"
            ></i>

          </button>

        </section>


        <!-- MESSAGE -->

        <section class="home-message">

          <div class="home-message-icon">
            <i class="fa-solid fa-paper-plane"></i>
          </div>

          <div>

            <strong>
              A better campus starts with you.
            </strong>

            <span>
              Every survey helps improve
              the VKU campus.
            </span>

          </div>

        </section>


        <!-- RECENT -->

        ${
          recent.length
            ? `
              <section class="home-recent">

                <div class="home-section-title">

                  <div>

                    <small>
                      RECENT
                    </small>

                    <h2>
                      Latest surveys
                    </h2>

                  </div>

                  <button
                    id="home-view-all"
                  >
                    View all
                  </button>

                </div>


                <div class="home-recent-list">

                  ${recent
                    .map(
                      survey => `
                        <button
                          class="home-recent-item"
                          data-survey-id="${survey.id}"
                        >

                          <div class="recent-room">
                            ${escapeHtml(
                              survey.room
                            )}
                          </div>

                          <div class="recent-info">

                            <strong>
                              ${escapeHtml(
                                survey.building
                              )}
                            </strong>

                            <span>
                              ${escapeHtml(
                                survey.facility
                              )}
                            </span>

                          </div>

                          <span
                            class="
                              survey-status
                              ${statusClass(
                                survey.status
                              )}
                            "
                          >
                            ${escapeHtml(
                              survey.status
                            )}
                          </span>

                        </button>
                      `
                    )
                    .join('')}

                </div>

              </section>
            `
            : ''
        }


        ${renderBottomNav('home')}

      </div>

    `


    // =============================================
    // EVENTS
    // =============================================

    document
      .querySelector('#new-survey')
      .addEventListener(
        'click',
        renderNewSurvey
      )


    document
      .querySelector('#home-surveys')
      .addEventListener(
        'click',
        renderMySurveys
      )


    document
      .querySelector('#home-sync')
      .addEventListener(
        'click',
        renderSyncStatus
      )


    document
      .querySelector('#home-view-all')
      ?.addEventListener(
        'click',
        renderMySurveys
      )


    document
      .querySelector('#open-menu')
      .addEventListener(
        'click',
        renderSideMenu
      )


    document
      .querySelectorAll(
        '.home-recent-item'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          async () => {

            const id =
              Number(
                button.dataset.surveyId
              )

            const all =
              await getAllSurveys()

            selectedSurvey =
              all.find(
                survey =>
                  Number(survey.id) === id
              )

            if (selectedSurvey) {
              renderSurveyDetail(
                selectedSurvey
              )
            }

          }
        )

      })


    bindBottomNav()

  } catch (error) {

    console.error(
      'Home error:',
      error
    )

    app.innerHTML = `
      <div class="error-screen">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h2>Unable to load app</h2>
        <p>Please refresh the page.</p>
      </div>
    `

  }

}


// ========================================
// NEW SURVEY
// ========================================

function renderNewSurvey() {
  app.innerHTML = `
    <div class="app survey-page">

      <!-- ==================================
           HEADER
      ================================== -->

      <header class="page-header">

        <button
          class="page-back-button"
          id="back-home"
          aria-label="Back"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="page-header-title">
          <h1>New Survey</h1>
        </div>

        <div class="page-header-placeholder"></div>

      </header>


      <!-- ==================================
           FORM
      ================================== -->

      <main class="survey-form">

        <!-- ==================================
             LOCATION INFORMATION
        ================================== -->

        <section class="survey-section">

          <div class="survey-section-heading">

            <div class="survey-section-icon blue">
              <i class="fa-solid fa-location-dot"></i>
            </div>

            <div>
              <p>LOCATION INFORMATION</p>
              <h2>Where is the facility?</h2>
            </div>

          </div>


          <!-- BUILDING -->

          <div class="survey-field">

            <label for="building">
              Building
            </label>

            <div class="survey-input-wrapper">

              <select id="building">

                <option value="">
                  Select building
                </option>

                <option value="A">
                  A - Administration Building
                </option>

                <option value="B">
                  B - Classroom Building
                </option>

                <option value="C">
                  C - Laboratory Building
                </option>

              </select>

              <i class="fa-solid fa-chevron-down"></i>

            </div>

          </div>


          <!-- ROOM -->

          <div class="survey-field">

            <label for="room">
              Room
            </label>

            <div class="survey-input-wrapper">

              <input
                id="room"
                type="text"
                placeholder="e.g. A101"
                autocomplete="off"
              />

            </div>

          </div>

        </section>


        <!-- ==================================
             FACILITY INFORMATION
        ================================== -->

        <section class="survey-section">

          <div class="survey-section-heading">

            <div class="survey-section-icon red">
              <i class="fa-solid fa-list-check"></i>
            </div>

            <div>
              <p>FACILITY INFORMATION</p>
              <h2>What are you inspecting?</h2>
            </div>

          </div>


          <!-- FACILITY -->

          <div class="survey-field">

            <label for="facility">
              Facility Type
            </label>

            <div class="survey-input-wrapper">

              <select id="facility">

                <option value="">
                  Select facility
                </option>

                <option value="Projector">
                  Projector
                </option>

                <option value="Computer">
                  Computer
                </option>

                <option value="Air Conditioner">
                  Air Conditioner
                </option>

                <option value="Lighting">
                  Lighting
                </option>

                <option value="Desk / Chair">
                  Desk / Chair
                </option>

              </select>

              <i class="fa-solid fa-chevron-down"></i>

            </div>

          </div>


          <!-- CONDITION -->

          <div class="survey-field">

            <label>
              Condition
            </label>

            <div class="condition-grid">

              <label class="condition-card good">

                <input
                  type="radio"
                  name="condition"
                  value="Good"
                />

                <div class="condition-card-content">

                  <i class="fa-solid fa-thumbs-up"></i>

                  <span>Good</span>

                </div>

              </label>


              <label class="condition-card fair">

                <input
                  type="radio"
                  name="condition"
                  value="Fair"
                />

                <div class="condition-card-content">

                  <i class="fa-solid fa-circle-minus"></i>

                  <span>Fair</span>

                </div>

              </label>


              <label class="condition-card poor">

                <input
                  type="radio"
                  name="condition"
                  value="Poor"
                />

                <div class="condition-card-content">

                  <i class="fa-solid fa-thumbs-down"></i>

                  <span>Poor</span>

                </div>

              </label>

            </div>

          </div>

        </section>


        <!-- ==================================
             DESCRIPTION
        ================================== -->

        <section class="survey-section">

          <div class="survey-section-heading">

            <div class="survey-section-icon gray">
              <i class="fa-solid fa-note-sticky"></i>
            </div>

            <div>
              <p>ADDITIONAL DETAILS</p>
              <h2>Add a note</h2>
            </div>

          </div>


          <div class="survey-field">

            <label for="description">
              Description
              <span class="optional">
                Optional
              </span>
            </label>

            <textarea
              id="description"
              rows="4"
              placeholder="Describe the current condition..."
            ></textarea>

          </div>

        </section>


        <!-- ==================================
             ADD EVIDENCE
        ================================== -->

        <section class="survey-section evidence-section">

          <div class="survey-section-heading">

            <div class="survey-section-icon orange">
              <i class="fa-solid fa-paperclip"></i>
            </div>

            <div>
              <p>ADD EVIDENCE</p>
              <h2>Support your report</h2>
            </div>

          </div>


          <!-- LOCATION -->

          <div class="evidence-card">

            <div class="evidence-icon blue">
              <i class="fa-solid fa-location-dot"></i>
            </div>

            <div class="evidence-info">

              <strong>
                Location
              </strong>

              <span id="location-status">
                Not added yet
              </span>

            </div>

            <button
              type="button"
              class="evidence-button"
              id="get-location"
            >
              Get Location
            </button>

          </div>


          <!-- PHOTO -->

          <div class="evidence-card">

            <div class="evidence-icon purple">
              <i class="fa-solid fa-camera"></i>
            </div>

            <div class="evidence-info">

              <strong>
                Photo
              </strong>

              <span id="photo-status">
                No photo yet
              </span>

            </div>

            <button
              type="button"
              class="evidence-button"
              id="take-photo"
            >
              Take Photo
            </button>

          </div>


          <!-- Hidden photo input -->

          <input
            type="file"
            id="photo-input"
            accept="image/*"
            capture="environment"
            hidden
          />

        </section>


        <!-- ==================================
             SAVE
        ================================== -->

        <button
          type="button"
          class="survey-save-button"
          id="submit-survey"
        >

          <i class="fa-solid fa-check"></i>

          <span>
            Save Survey
          </span>

        </button>


        <p class="survey-save-note">
          Your survey will be saved locally and
          synced when you're online.
        </p>

      </main>

    </div>
  `


  // ========================================
  // BACK
  // ========================================

  document
    .querySelector('#back-home')
    .addEventListener(
      'click',
      renderHome
    )


  // ========================================
  // SUBMIT
  // ========================================

  document
    .querySelector('#submit-survey')
    .addEventListener(
      'click',
      handleSubmit
    )


  // ========================================
  // GET LOCATION
  // ========================================

  document
    .querySelector('#get-location')
    .addEventListener(
      'click',
      () => {

        if (!navigator.geolocation) {

          alert(
            'Geolocation is not supported by this browser.'
          )

          return
        }


        const locationStatus =
          document.querySelector(
            '#location-status'
          )


        locationStatus.textContent =
          'Requesting permission...'


        navigator.geolocation.getCurrentPosition(

  (position) => {

    const latitude =
      position.coords.latitude

    const longitude =
      position.coords.longitude


    // Lưu GPS để handleSubmit() sử dụng
    currentLocation = {
      latitude,
      longitude,
      accuracy: position.coords.accuracy,
      capturedAt: new Date().toISOString()
    }


    const locationStatus =
      document.querySelector(
        '#location-status'
      )


    locationStatus.textContent =
      `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`


    locationStatus.classList.add(
      'available'
    )


    const button =
      document.querySelector(
        '#get-location'
      )


    button.textContent =
      'Change'


    button.classList.add(
      'completed'
    )

  },

  (error) => {

    console.error(
      'Location error:',
      error
    )


    currentLocation = null


    const locationStatus =
      document.querySelector(
        '#location-status'
      )


    locationStatus.textContent =
      'Location not available'


    alert(
      'Location permission was not granted.'
    )

  },

  {
    enableHighAccuracy: true,

    timeout: 10000,

    maximumAge: 0
  }
      )
    }
  )

// ========================================
// PHOTO
// ========================================

  const photoButton =
    document.querySelector(
      '#take-photo'
    )

  const photoInput =
    document.querySelector(
      '#photo-input'
    )


  photoButton.addEventListener(
    'click',
    () => {
      photoInput.click()
    }
  )


  photoInput.addEventListener(
    'change',
    (event) => {

      const file =
        event.target.files?.[0]

      currentPhoto = file


      if (!file) {
        return
      }


      const photoStatus =
        document.querySelector(
          '#photo-status'
        )


      photoStatus.textContent =
        file.name


      photoStatus.classList.add(
        'available'
      )


      photoButton.textContent =
        'Retake'


      photoButton.classList.add(
        'completed'
      )

    }
  )

}

// =====================================================
// SAVE SURVEY
// =====================================================

async function handleSubmit() {

  const building =
    document
      .querySelector('#building')
      .value


  const room =
    document
      .querySelector('#room')
      .value
      .trim()


  const facility =
    document
      .querySelector('#facility')
      .value


  const condition =
  document.querySelector(
    'input[name="condition"]:checked'
  )?.value


  const description =
    document
      .querySelector('#description')
      .value
      .trim()


  if (!building) {
    alert('Please select a building.')
    return
  }


  if (!room) {
    alert('Please enter the room.')
    return
  }


  if (!facility) {
    alert('Please select a facility.')
    return
  }


  if (!condition) {
    alert('Please select the condition.')
    return
  }


  const survey = {

    id: Date.now(),

    building,

    room,

    facility,

    condition,

    description,

    location:
      currentLocation,

    photo:
      currentPhoto,

    status: 'Pending',

    createdAt:
      new Date().toISOString()

  }


  try {

    const db =
      await dbPromise


    const transaction =
      db.transaction(
        'surveys',
        'readwrite'
      )


    const store =
      transaction.objectStore(
        'surveys'
      )


    store.add(survey)


    transaction.oncomplete =
      () => {

        renderSuccess(
          survey
        )

      }


    transaction.onerror =
      () => {

        console.error(
          transaction.error
        )

        alert(
          'Could not save the survey.'
        )

      }

  } catch (error) {

    console.error(
      'Save error:',
      error
    )

    alert(
      'Could not open the local database.'
    )

  }

}


// =====================================================
// SUCCESS
// =====================================================

function renderSuccess(survey) {

  app.innerHTML = `

    <div class="success-page">

      <div class="success-confetti"></div>


      <div class="success-check">

        <i class="fa-solid fa-check"></i>

      </div>


      <h1>
        Survey Saved!
      </h1>


      <p>
        Your survey has been saved locally
        and will be synced when online.
      </p>


      <div class="success-survey-card">

        <strong>
          Survey #${escapeHtml(
            survey.id
          )}
        </strong>

        <span>
          ${escapeHtml(
            survey.building
          )}
        </span>

        <span>
          ${escapeHtml(
            survey.room
          )}
          •
          ${escapeHtml(
            survey.facility
          )}
        </span>

        <span
          class="
            survey-status
            pending
          "
        >
          Pending
        </span>

      </div>


      <button
        class="success-primary"
        id="another-survey"
      >
        Add Another Survey
      </button>


      <button
        class="success-secondary"
        id="view-surveys"
      >
        View My Surveys
      </button>


      <button
        class="success-text"
        id="success-home"
      >
        Back to Home
      </button>


      <div class="success-campus">

        <i class="fa-solid fa-building"></i>

        <strong>
          Together for a better VKU
        </strong>

        <span>
          Thank you for your contribution!
        </span>

      </div>

    </div>

  `


  document
    .querySelector('#another-survey')
    .addEventListener(
      'click',
      renderNewSurvey
    )


  document
    .querySelector('#view-surveys')
    .addEventListener(
      'click',
      renderMySurveys
    )


  document
    .querySelector('#success-home')
    .addEventListener(
      'click',
      renderHome
    )

}


// =====================================================
// MY SURVEYS
// =====================================================

async function renderMySurveys() {

  try {

    const surveys =
      await getAllSurveys()


    app.innerHTML = `

      <div class="vku-page surveys-page">

        ${renderHeader('My Surveys')}


        <main class="surveys-main">


          <!-- SEARCH -->

          <div class="survey-search">

            <i
              class="
                fa-solid
                fa-magnifying-glass
              "
            ></i>

            <input
              id="survey-search"
              type="search"
              placeholder="Search surveys..."
            />

          </div>


          <!-- FILTER -->

          <div class="survey-filters">

            <button
              class="survey-filter active"
              data-filter="All"
            >
              All (${surveys.length})
            </button>

            <button
              class="survey-filter"
              data-filter="Pending"
            >
              Pending (
              ${
                surveys.filter(
                  s => s.status !== 'Synced'
                ).length
              }
              )
            </button>

            <button
              class="survey-filter"
              data-filter="Synced"
            >
              Synced (
              ${
                surveys.filter(
                  s => s.status === 'Synced'
                ).length
              }
              )
            </button>

          </div>


          <div
            id="survey-list"
            class="survey-list"
          ></div>


        </main>


        ${renderBottomNav('surveys')}

      </div>

    `


    const list =
      document.querySelector(
        '#survey-list'
      )


    let activeFilter =
      'All'


    function drawList() {

      const search =
        document
          .querySelector(
            '#survey-search'
          )
          .value
          .toLowerCase()
          .trim()


      let filtered =
        surveys.filter(
          survey => {

            const matchesFilter =
              activeFilter === 'All'
                ? true
                : activeFilter === 'Synced'
                  ? survey.status === 'Synced'
                  : survey.status !== 'Synced'


            const searchable = `
              ${survey.room}
              ${survey.building}
              ${survey.facility}
              ${survey.condition}
              ${survey.description}
            `.toLowerCase()


            return (
              matchesFilter &&
              searchable.includes(search)
            )

          }
        )


      filtered =
        filtered
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )


      if (!filtered.length) {

        list.innerHTML = `

          <div class="empty-surveys">

            <div>
              <i
                class="
                  fa-solid
                  fa-clipboard-list
                "
              ></i>
            </div>

            <h2>
              No surveys found
            </h2>

            <p>
              Try another search or filter.
            </p>

          </div>

        `

        return
      }


      list.innerHTML =
        filtered
          .map(
            survey => `

              <button
                class="survey-list-card"
                data-id="${survey.id}"
              >

                <div class="survey-list-main">

                  <strong>
                    ${escapeHtml(
                      survey.room
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      survey.building
                    )}
                  </span>

                  <small>

                    <i
                      class="
                        fa-solid
                        fa-location-dot
                      "
                    ></i>

                    ${escapeHtml(
                      survey.facility
                    )}

                    •

                    <b
                      class="
                        condition-text
                        ${conditionClass(
                          survey.condition
                        )}
                      "
                    >
                      ${escapeHtml(
                        survey.condition
                      )}
                    </b>

                  </small>

                </div>


                <div
                  class="
                    survey-list-side
                  "
                >

                  <span
                    class="
                      survey-status
                      ${statusClass(
                        survey.status
                      )}
                    "
                  >
                    ${escapeHtml(
                      survey.status
                    )}
                  </span>

                  <small>
                    ${formatDate(
                      survey.createdAt
                    )}
                  </small>

                </div>

              </button>

            `
          )
          .join('')


      document
        .querySelectorAll(
          '.survey-list-card'
        )
        .forEach(card => {

          card.addEventListener(
            'click',
            () => {

              const id =
                Number(
                  card.dataset.id
                )


              selectedSurvey =
                surveys.find(
                  survey =>
                    Number(
                      survey.id
                    ) === id
                )


              if (selectedSurvey) {
                renderSurveyDetail(
                  selectedSurvey
                )
              }

            }
          )

        })

    }


    drawList()


    document
      .querySelector(
        '#survey-search'
      )
      .addEventListener(
        'input',
        drawList
      )


    document
      .querySelectorAll(
        '.survey-filter'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            document
              .querySelectorAll(
                '.survey-filter'
              )
              .forEach(
                item =>
                  item.classList.remove(
                    'active'
                  )
              )


            button.classList.add(
              'active'
            )


            activeFilter =
              button.dataset.filter


            drawList()

          }
        )

      })


    document
      .querySelector('#back-button')
      .addEventListener(
        'click',
        renderHome
      )


    bindBottomNav()

  } catch (error) {

    console.error(
      'Surveys error:',
      error
    )

    alert(
      'Could not load surveys.'
    )

  }

}


// =====================================================
// SURVEY DETAIL
// =====================================================

function renderSurveyDetail(survey) {

  selectedSurvey = survey


  const hasLocation =
    survey.location &&
    typeof survey.location.latitude === 'number'


  app.innerHTML = `

    <div class="vku-page detail-page">

      ${renderHeader('Survey Detail')}


      <main class="detail-main">


        <!-- STATUS -->

        <div class="detail-top">

          <span
            class="
              survey-status
              ${statusClass(
                survey.status
              )}
            "
          >
            ${escapeHtml(
              survey.status
            )}
          </span>

        </div>


        <!-- TITLE -->

        <h1>
          ${escapeHtml(
            survey.room
          )}
        </h1>


        <p class="detail-building">
          ${escapeHtml(
            survey.building
          )}
        </p>


        <!-- INFORMATION -->

        <section class="detail-card">

          <h2>
            Information
          </h2>


          <div class="detail-row">

            <span>
              Facility Type
            </span>

            <strong>
              ${escapeHtml(
                survey.facility
              )}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Condition
            </span>

            <strong
              class="
                condition-text
                ${conditionClass(
                  survey.condition
                )}
              "
            >
              ${escapeHtml(
                survey.condition
              )}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Description
            </span>

            <strong>
              ${
                survey.description
                  ? escapeHtml(
                      survey.description
                    )
                  : 'No description'
              }
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Created
            </span>

            <strong>
              ${formatDate(
                survey.createdAt
              )}
              ${formatTime(
                survey.createdAt
              )}
            </strong>

          </div>

        </section>


        <!-- LOCATION -->

        <section class="detail-card">

          <h2>
            Location
          </h2>


          ${
            hasLocation
              ? `
                <div class="detail-location">

                  <i
                    class="
                      fa-solid
                      fa-location-dot
                    "
                  ></i>

                  <div>

                    <strong>
                      ${survey.location.latitude.toFixed(6)},
                      ${survey.location.longitude.toFixed(6)}
                    </strong>

                    <span>
                      Location captured with permission
                    </span>

                  </div>

                </div>
              `
              : `
                <div class="detail-empty">
                  <i
                    class="
                      fa-solid
                      fa-location-dot
                    "
                  ></i>

                  Location not added
                </div>
              `
          }

        </section>


        <!-- PHOTO -->

        <section class="detail-card">

          <h2>
            Photo
          </h2>


          ${
            survey.photo
              ? `
                <img
                  class="detail-photo"
                  src="${URL.createObjectURL(survey.photo)}"
                  alt="Survey evidence"
                />
              `
              : `
                <div class="detail-empty">

                  <i
                    class="
                      fa-solid
                      fa-camera
                    "
                  ></i>

                  No photo attached

                </div>
              `
          }

        </section>


        <!-- ACTIONS -->

        <div class="detail-actions">

          <button
            class="detail-edit"
            id="detail-edit"
          >
            <i class="fa-solid fa-pen"></i>
            Edit
          </button>


          <button
            class="detail-delete"
            id="detail-delete"
          >
            <i class="fa-solid fa-trash"></i>
            Delete
          </button>

        </div>


      </main>

    </div>

  `


  document
    .querySelector('#back-button')
    .addEventListener(
      'click',
      renderMySurveys
    )


  document
    .querySelector('#detail-edit')
    .addEventListener(
      'click',
      () => {

        alert(
          'Edit mode will be connected next.'
        )

      }
    )


  document
    .querySelector('#detail-delete')
    .addEventListener(
      'click',
      async () => {

        const confirmed =
          confirm(
            'Are you sure you want to delete this survey?'
          )


        if (!confirmed) {
          return
        }


        try {

          await deleteSurvey(
            Number(survey.id)
          )

          renderMySurveys()

        } catch (error) {

          console.error(
            'Delete error:',
            error
          )

          alert(
            'Could not delete this survey.'
          )

        }

      }
    )

}


// =====================================================
// SYNC STATUS
// =====================================================

async function renderSyncStatus() {

  try {

    const surveys =
      await getAllSurveys()


    const pending =
      surveys.filter(
        survey =>
          survey.status !== 'Synced'
      ).length


    const synced =
      surveys.filter(
        survey =>
          survey.status === 'Synced'
      ).length


    const online =
      navigator.onLine


    app.innerHTML = `

      <div class="vku-page sync-page">

        ${renderHeader('Sync Status')}


        <main class="sync-main">


          <div class="sync-hero">

            <div class="sync-cloud">

              <i
                class="
                  fa-solid
                  fa-cloud
                "
              ></i>

            </div>


            <h1>
              ${
                pending
                  ? 'Ready to Sync'
                  : 'All Synced'
              }
            </h1>


            <p>
              ${
                pending
                  ? `${pending} survey${pending === 1 ? '' : 's'} pending sync`
                  : 'Your local data is up to date.'
              }
            </p>


            ${
              pending
                ? `
                  <button
                    class="sync-now-button"
                    id="sync-now"
                  >
                    <i class="fa-solid fa-rotate"></i>
                    Sync Now
                  </button>
                `
                : ''
            }

          </div>


          <section class="sync-info-card">

            <div class="sync-info-row">

              <span>
                Last Sync
              </span>

              <strong>
                ${synced
                  ? 'Available'
                  : 'Not synced yet'}
              </strong>

            </div>


            <div class="sync-info-row">

              <span>
                Connection
              </span>

              <strong
                class="
                  ${online
                    ? 'online'
                    : 'offline'}
                "
              >
                ${
                  online
                    ? 'Online'
                    : 'Offline'
                }
              </strong>

            </div>


            <div class="sync-info-row">

              <span>
                Sync Settings
              </span>

              <strong>
                Wi-Fi only
              </strong>

            </div>

          </section>


          <section class="sync-history">

            <h2>
              Sync History
            </h2>


            <div class="sync-history-item">

              <div class="history-icon success">
                <i
                  class="
                    fa-solid
                    fa-check
                  "
                ></i>
              </div>

              <div>

                <strong>
                  Local data ready
                </strong>

                <span>
                  ${pending} pending surveys
                </span>

              </div>

            </div>


            <div class="sync-history-item">

              <div class="history-icon neutral">
                <i
                  class="
                    fa-solid
                    fa-database
                  "
                ></i>
              </div>

              <div>

                <strong>
                  IndexedDB
                </strong>

                <span>
                  ${surveys.length} surveys stored locally
                </span>

              </div>

            </div>

          </section>


        </main>


        ${renderBottomNav('sync')}

      </div>

    `


    document
      .querySelector('#back-button')
      .addEventListener(
        'click',
        renderHome
      )


    document
  .querySelector('#sync-now')
  ?.addEventListener(
    'click',
    async () => {
      const surveys = await getAllSurveys()

      const pendingSurveys =
        surveys.filter(
          survey => survey.status !== 'Synced'
        )

      if (pendingSurveys.length === 0) {
        alert('No surveys to sync.')
        return
      }

      try {
        for (const survey of pendingSurveys) {
          await fetch(
            'https://script.google.com/macros/s/AKfycbxdRnwb7l4ikNhcH7oB1Z4bgeo4m6i2iyEQz8lOpV5xk1xGEI5-6nQInzmgqPLBCkVI/exec',
            {
              method: 'POST',
              body: JSON.stringify({
                ...survey,
                photo: survey.photo
                  ? survey.photo.name
                  : ''
              })
            }
          )

          survey.status = 'Synced'

          await saveSurvey(survey)
        }

        alert(
          `${pendingSurveys.length} surveys synced successfully.`
        )

        renderSyncStatus()

      } catch (error) {
        console.error('Sync error:', error)
        alert('Sync failed.')
      }
    }
  )

    bindBottomNav()

  } catch (error) {

    console.error(
      'Sync error:',
      error
    )

    alert(
      'Could not load sync status.'
    )

  }

}


// =====================================================
// SETTINGS
// =====================================================

function renderSettings() {

  app.innerHTML = `

    <div class="vku-page settings-page">

      ${renderHeader('Settings')}


      <main class="settings-main">


        <!-- ACCOUNT -->

        <section class="settings-section">

          <small>
            ACCOUNT
          </small>


          <button
            class="settings-row"
          >

            <div class="settings-icon red">
              <i class="fa-solid fa-user"></i>
            </div>

            <div>

              <strong>
                User Profile
              </strong>

              <span>
                Duy - Student - VKU
              </span>

            </div>

            <i
              class="
                fa-solid
                fa-chevron-right
              "
            ></i>

          </button>

        </section>


        <!-- APP SETTINGS -->

        <section class="settings-section">

          <small>
            APP SETTINGS
          </small>


          <div class="settings-row">

            <div class="settings-icon blue">
              <i class="fa-solid fa-wifi"></i>
            </div>

            <div>

              <strong>
                Offline Mode
              </strong>

              <span>
                Enabled
              </span>

            </div>

            <label class="switch">

              <input
                type="checkbox"
                checked
              />

              <span></span>

            </label>

          </div>


          <div class="settings-row">

            <div class="settings-icon blue">
              <i class="fa-solid fa-bell"></i>
            </div>

            <div>

              <strong>
                Notifications
              </strong>

              <span>
                Sync complete, reminders
              </span>

            </div>

            <label class="switch">

              <input
                id="notification-toggle"
                type="checkbox"
              />

              <span></span>

            </label>

          </div>


          <button
            class="settings-row"
            id="language-setting"
          >

            <div class="settings-icon blue">
              <i class="fa-solid fa-language"></i>
            </div>

            <div>

              <strong>
                Language
              </strong>

              <span>
                English
              </span>

            </div>

            <i
              class="
                fa-solid
                fa-chevron-right
              "
            ></i>

          </button>

        </section>


        <!-- ABOUT -->

        <section class="settings-section">

          <small>
            ABOUT
          </small>


          <div class="settings-row">

            <div class="settings-icon blue">
              <i class="fa-solid fa-clock"></i>
            </div>

            <div>

              <strong>
                Version
              </strong>

            </div>

            <span class="settings-value">
              1.0.0
            </span>

          </div>


          <button
            class="settings-row"
          >

            <div class="settings-icon blue">
              <i class="fa-solid fa-shield"></i>
            </div>

            <div>

              <strong>
                Privacy Policy
              </strong>

            </div>

            <i
              class="
                fa-solid
                fa-chevron-right
              "
            ></i>

          </button>


          <button
            class="settings-row"
          >

            <div class="settings-icon blue">
              <i class="fa-solid fa-circle-question"></i>
            </div>

            <div>

              <strong>
                Help & Support
              </strong>

            </div>

            <i
              class="
                fa-solid
                fa-chevron-right
              "
            ></i>

          </button>

        </section>


        <button
          class="sign-out-button"
        >
          Sign Out
        </button>


      </main>


      ${renderBottomNav('settings')}

    </div>

  `


  document
    .querySelector('#back-button')
    .addEventListener(
      'click',
      renderHome
    )


  document
    .querySelector('#language-setting')
    .addEventListener(
      'click',
      () => {
        alert(
          'Language settings will be available later.'
        )
      }
    )


  document
    .querySelector(
      '#notification-toggle'
    )
    .addEventListener(
      'change',
      async event => {

        if (
          event.target.checked &&
          'Notification' in window
        ) {

          const permission =
            await Notification.requestPermission()

          if (
            permission !== 'granted'
          ) {

            event.target.checked =
              false

          }

        }

      }
    )


  bindBottomNav()

}
// ========================================
// TEST NOTIFICATION
// ========================================

async function showTestNotification() {
  if (!('Notification' in window)) {
    alert('Notifications are not supported.')
    return
  }

  const permission =
    await Notification.requestPermission()

  if (permission === 'granted') {
    new Notification(
      'VKU Field Survey',
      {
        body: 'Notification is working successfully!',
        icon: '/pwa-192x192.png'
      }
    )
  }
}
showTestNotification()
// =====================================================
// SIDE MENU
// =====================================================

function renderSideMenu() {

  app.innerHTML = `

    <div class="side-menu-overlay">

      <aside class="side-menu">

        <div class="side-menu-header">

          <div class="side-menu-profile">

            <div class="side-menu-avatar">
              <i class="fa-solid fa-user"></i>
            </div>

            <div>

              <strong>
                Duy
              </strong>

              <span>
                Student - VKU
              </span>

            </div>

          </div>


          <button
            id="close-menu"
            class="side-menu-close"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

        </div>


        <nav class="side-menu-nav">


          <button
            data-menu="home"
          >
            <i class="fa-solid fa-house"></i>
            Home
          </button>


          <button
            data-menu="surveys"
          >
            <i class="fa-solid fa-list-check"></i>
            My Surveys
          </button>


          <button
            data-menu="sync"
          >
            <i class="fa-solid fa-cloud"></i>
            Sync Status
          </button>


          <button
            data-menu="settings"
          >
            <i class="fa-solid fa-gear"></i>
            Settings
          </button>

        </nav>


        <div class="side-menu-footer">

          <p>
            "Every small report creates
            a big change."
          </p>

          <strong>
            VKU Field Survey
          </strong>

          <span>
            v1.0.0
          </span>

        </div>

      </aside>

    </div>

  `


  document
    .querySelector('#close-menu')
    .addEventListener(
      'click',
      renderHome
    )


  document
    .querySelectorAll(
      '[data-menu]'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          const destination =
            button.dataset.menu

          if (destination === 'home') {
            renderHome()
          }

          if (destination === 'surveys') {
            renderMySurveys()
          }

          if (destination === 'sync') {
            renderSyncStatus()
          }

          if (destination === 'settings') {
            renderSettings()
          }

        }
      )

    })

}


// =====================================================
// ONLINE / OFFLINE
// =====================================================

window.addEventListener(
  'online',
  () => {

    console.log(
      'VKU Field Survey: Online'
    )

  }
)


window.addEventListener(
  'online',
  () => {

    if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    if ('sync' in registration) {
      registration.sync.register('sync-surveys')
    }
  })
}

    console.log(
      'VKU Field Survey: Online'
    )

  }
)


// =====================================================
// SERVICE WORKER
// =====================================================

if (
  'serviceWorker' in navigator
) {

  navigator.serviceWorker
    .register('/sw.js')
    .then(
      () => {
        console.log(
          'Service Worker registered'
        )
      }
    )
    .catch(
      error => {
        console.error(
          'Service Worker registration failed:',
          error
        )
      }
    )

}


// =====================================================
// START
// =====================================================

renderSplash()