import './style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import {
  dbPromise,
  getAllSurveys,
  deleteSurvey
} from './db.js'


// ========================================
// APP CONTAINER
// ========================================

const app = document.querySelector('#app')


// ========================================
// HOME
// ========================================

function renderHome() {

  app.innerHTML = `
    <div class="app">

      <header class="header">

        <button
          class="icon-button"
          id="menu-button"
          aria-label="Menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>

        <h1>VKU Field Survey</h1>

        <button
          class="icon-button"
          id="profile-button"
          aria-label="Profile"
        >
          <i class="fa-solid fa-user"></i>
        </button>

      </header>


      <main class="home-content">

        <section class="intro">

          <p>Hello,</p>

          <h2>
            Let's make VKU better!
          </h2>

          <p class="intro-description">
            Inspect and record campus facilities
            quickly and easily.
          </p>

        </section>


        <section class="actions">

          <button
            class="action-card"
            id="new-survey-btn"
          >

            <div class="action-icon">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>

            <div class="action-info">
              <h3>New Survey</h3>
              <p>Inspect a facility</p>
            </div>

            <i class="fa-solid fa-chevron-right arrow"></i>

          </button>


          <button
            class="action-card"
            id="my-surveys-btn"
          >

            <div class="action-icon">
              <i class="fa-solid fa-list-check"></i>
            </div>

            <div class="action-info">
              <h3>My Surveys</h3>
              <p>View and manage surveys</p>
            </div>

            <i class="fa-solid fa-chevron-right arrow"></i>

          </button>


          <button
            class="action-card"
            id="sync-btn"
          >

            <div class="action-icon">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>

            <div class="action-info">
              <h3>Sync Status</h3>
              <p>Check your offline data</p>
            </div>

            <i class="fa-solid fa-chevron-right arrow"></i>

          </button>

        </section>


        <section class="message-card">

          <div class="message-icon">
            <i class="fa-solid fa-leaf"></i>
          </div>

          <div>

            <h3>
              A better campus starts with you.
            </h3>

            <p>
              Every survey helps improve
              the VKU campus.
            </p>

          </div>

        </section>

      </main>

    </div>
  `


  document
    .querySelector('#new-survey-btn')
    .addEventListener(
      'click',
      renderNewSurvey
    )


  document
    .querySelector('#my-surveys-btn')
    .addEventListener(
      'click',
      renderMySurveys
    )


  document
    .querySelector('#sync-btn')
    .addEventListener(
      'click',
      renderSyncStatus
    )


  document
    .querySelector('#menu-button')
    .addEventListener('click', () => {

      alert('Menu will be developed later.')

    })


  document
    .querySelector('#profile-button')
    .addEventListener('click', () => {

      alert('Profile will be developed later.')

    })

}


// ========================================
// NEW SURVEY
// ========================================

function renderNewSurvey() {

  app.innerHTML = `
    <div class="app">

      <header class="header">

        <button
          class="icon-button"
          id="back-home"
          aria-label="Back"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <h1>New Survey</h1>

        <div class="header-placeholder"></div>

      </header>


      <main class="form-content">

        <section class="form-section">

          <p class="form-section-label">
            1. LOCATION
          </p>


          <label for="building">
            Building
          </label>

          <select id="building">

            <option value="">
              Select building
            </option>

            <option value="A">
              A - Administration
            </option>

            <option value="B">
              B - Classroom
            </option>

            <option value="C">
              C - Laboratory
            </option>

          </select>


          <label for="room">
            Room
          </label>

          <input
            id="room"
            type="text"
            placeholder="e.g. A101"
          />

        </section>


        <section class="form-section">

          <p class="form-section-label">
            2. FACILITY INFORMATION
          </p>


          <label for="facility">
            Facility Type
          </label>

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


          <label>
            Condition
          </label>


          <div class="condition-options">

            <label class="condition-option">

              <input
                type="radio"
                name="condition"
                value="Good"
              />

              <span>Good</span>

            </label>


            <label class="condition-option">

              <input
                type="radio"
                name="condition"
                value="Fair"
              />

              <span>Fair</span>

            </label>


            <label class="condition-option">

              <input
                type="radio"
                name="condition"
                value="Poor"
              />

              <span>Poor</span>

            </label>

          </div>

        </section>


        <section class="form-section">

          <p class="form-section-label">
            3. ADDITIONAL DETAILS
          </p>


          <label for="description">
            Description
          </label>

          <textarea
            id="description"
            rows="5"
            placeholder="Describe the current condition..."
          ></textarea>

        </section>


        <button
          class="submit-button"
          id="submit-survey"
        >

          SUBMIT SURVEY

          <i class="fa-solid fa-arrow-right"></i>

        </button>


      </main>

    </div>
  `


  document
    .querySelector('#back-home')
    .addEventListener(
      'click',
      renderHome
    )


  document
    .querySelector('#submit-survey')
    .addEventListener(
      'click',
      handleSubmit
    )

}


// ========================================
// HANDLE SUBMIT
// ========================================

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
    document
      .querySelector(
        'input[name="condition"]:checked'
      )
      ?.value


  const description =
    document
      .querySelector('#description')
      .value
      .trim()


  // ======================================
  // VALIDATION
  // ======================================

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


  // ======================================
  // CREATE SURVEY OBJECT
  // ======================================

  const survey = {

    id: Date.now(),

    building: building,

    room: room,

    facility: facility,

    condition: condition,

    description: description,

    status: 'Pending',

    createdAt:
      new Date().toLocaleString()

  }


  console.log(
    'New survey:',
    survey
  )


  // ======================================
  // SAVE TO INDEXEDDB
  // ======================================

  try {

    const db =
      await dbPromise


    const transaction =
      db.transaction(
        'surveys',
        'readwrite'
      )


    const store =
      transaction
        .objectStore('surveys')


    store.add(survey)


    transaction.oncomplete = () => {

      console.log(
        'Survey saved to IndexedDB:',
        survey
      )


      renderSuccess(survey)

    }


    transaction.onerror = () => {

      console.error(
        'Failed to save survey:',
        transaction.error
      )


      alert(
        'Could not save the survey. Please try again.'
      )

    }


  } catch (error) {

    console.error(
      'IndexedDB error:',
      error
    )


    alert(
      'Could not open the local database.'
    )

  }

}


// ========================================
// SUCCESS SCREEN
// ========================================

function renderSuccess(survey) {

  app.innerHTML = `
    <div class="app">

      <main class="success-content">

        <div class="success-icon">
          <i class="fa-solid fa-check"></i>
        </div>


        <h1>
          Survey Saved!
        </h1>


        <p>
          Your inspection has been recorded
          successfully.
        </p>


        <div class="saved-card">

          <div class="saved-icon">
            <i class="fa-solid fa-clock"></i>
          </div>


          <div>

            <h3>
              Survey #${survey.id}
            </h3>

            <p>
              ${survey.building}
              -
              ${survey.room}
              -
              ${survey.facility}
            </p>

            <span class="status pending">
              ${survey.status}
            </span>

          </div>

        </div>


        <button
          class="submit-button"
          id="another-survey"
        >
          ADD ANOTHER SURVEY
        </button>


        <button
          class="secondary-button"
          id="view-surveys"
        >
          VIEW MY SURVEYS
        </button>


        <button
          class="text-button"
          id="back-home-success"
        >
          BACK TO HOME
        </button>

      </main>

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
    .querySelector('#back-home-success')
    .addEventListener(
      'click',
      renderHome
    )

}


// ========================================
// MY SURVEYS
// ========================================

async function renderMySurveys() {

  try {

    // ======================================
    // GET ALL SURVEYS
    // ======================================

    const surveysFromDB =
      await getAllSurveys()


    console.log(
      'Surveys from IndexedDB:',
      surveysFromDB
    )


    // ======================================
    // CREATE SURVEY LIST
    // ======================================

    let surveyList = ''


    // ======================================
    // EMPTY STATE
    // ======================================

    if (
      surveysFromDB.length === 0
    ) {

      surveyList = `

        <div class="empty-state">

          <div class="empty-icon">

            <i class="fa-solid fa-clipboard">
            </i>

          </div>


          <h2>
            No surveys yet
          </h2>


          <p>
            Your completed surveys will
            appear here.
          </p>


          <button
            class="submit-button"
            id="empty-new-survey"
          >
            CREATE FIRST SURVEY
          </button>

        </div>

      `

    }


    // ======================================
    // HAS SURVEYS
    // ======================================

    else {

      surveyList =

        surveysFromDB
          .slice()
          .reverse()
          .map(survey => `

            <article
              class="survey-card"
            >


              <!-- ========================
                   TOP
              ========================= -->

              <div class="survey-card-top">


                <div class="survey-main-info">

                  <h3>
                    ${survey.room}
                  </h3>


                  <p class="survey-location">

                    ${survey.building}

                    <span>
                      ·
                    </span>

                    ${survey.facility}

                  </p>

                </div>


                <span
                  class="status pending"
                >
                  ${survey.status}
                </span>


              </div>


              <!-- ========================
                   DIVIDER
              ========================= -->

              <div
                class="survey-card-divider"
              >
              </div>


              <!-- ========================
                   META
              ========================= -->

              <div class="survey-meta">


                <span>

                  <i
                    class="fa-regular fa-clock"
                  ></i>

                  ${survey.createdAt}

                </span>


                <span>

                  Condition:

                  <strong>
                    ${survey.condition}
                  </strong>

                </span>


              </div>


              <!-- ========================
                   DESCRIPTION
              ========================= -->

              ${
                survey.description
                  ? `

                    <div
                      class="survey-description"
                    >

                      <div
                        class="description-label"
                      >
                        Description
                      </div>


                      <p
                        class="description-text"
                      >
                        ${survey.description}
                      </p>

                    </div>

                  `
                  : ''
              }


              <!-- ========================
                   DELETE
              ========================= -->

              <div
                class="survey-card-actions"
              >

                <button
                  class="delete-survey-btn"
                  data-id="${survey.id}"
                >

                  <i
                    class="fa-regular fa-trash-can"
                  ></i>

                  DELETE

                </button>

              </div>


            </article>

          `)
          .join('')

    }


    // ======================================
    // PAGE
    // ======================================

    app.innerHTML = `

      <div class="app">


        <!-- HEADER -->

        <header class="header">


          <button
            class="icon-button"
            id="back-home"
            aria-label="Back"
          >

            <i
              class="fa-solid fa-arrow-left"
            ></i>

          </button>


          <h1>
            My Surveys
          </h1>


          <div
            class="header-placeholder"
          >
          </div>


        </header>


        <!-- CONTENT -->

        <main
          class="surveys-content"
        >


          <!-- PAGE INTRO -->

          <div class="page-intro">


            <p
              class="form-section-label"
            >
              SURVEY RECORDS
            </p>


            <h2>

              ${surveysFromDB.length}

              ${
                surveysFromDB.length === 1
                  ? 'survey'
                  : 'surveys'
              }

            </h2>


          </div>


          <!-- SURVEY LIST -->

          <section
            class="survey-list"
          >

            ${surveyList}

          </section>


        </main>


      </div>

    `


    // ======================================
    // BACK HOME
    // ======================================

    document
      .querySelector('#back-home')
      .addEventListener(
        'click',
        renderHome
      )


    // ======================================
    // CREATE FIRST SURVEY
    // ======================================

    const newSurveyButton =
      document.querySelector(
        '#empty-new-survey'
      )


    if (newSurveyButton) {

      newSurveyButton
        .addEventListener(
          'click',
          renderNewSurvey
        )

    }


    // ======================================
    // DELETE BUTTONS
    // ======================================

    const deleteButtons =
      document.querySelectorAll(
        '.delete-survey-btn'
      )


    deleteButtons.forEach(button => {

      button.addEventListener(
        'click',
        async () => {

          const id =
            Number(
              button.dataset.id
            )


          // ==============================
          // CONFIRM
          // ==============================

          const confirmed =
            confirm(
              'Are you sure you want to delete this survey?'
            )


          if (!confirmed) {

            return

          }


          // ==============================
          // DELETE FROM INDEXEDDB
          // ==============================

          try {

            await deleteSurvey(id)


            console.log(
              'Survey removed successfully:',
              id
            )


            // ============================
            // REFRESH LIST
            // ============================

            await renderMySurveys()


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

    })


  } catch (error) {

    console.error(
      'Failed to load surveys:',
      error
    )


    alert(
      'Could not load surveys from IndexedDB.'
    )

  }

}


// ========================================
// SYNC STATUS
// ========================================

async function renderSyncStatus() {

  try {

    const db =
      await dbPromise


    const transaction =
      db.transaction(
        'surveys',
        'readonly'
      )


    const store =
      transaction
        .objectStore('surveys')


    const request =
      store.getAll()


    request.onsuccess = () => {

      const surveysFromDB =
        request.result


      const pendingCount =
        surveysFromDB.filter(
          survey =>
            survey.status === 'Pending'
        ).length


      const isOnline =
        navigator.onLine


      app.innerHTML = `

        <div class="app">

          <header class="header">

            <button
              class="icon-button"
              id="back-home"
              aria-label="Back"
            >

              <i class="fa-solid fa-arrow-left"></i>

            </button>


            <h1>
              Sync Status
            </h1>


            <div class="header-placeholder">
            </div>

          </header>


          <main class="sync-content">


            <div class="sync-status-icon">

              <i class="fa-solid fa-cloud"></i>

            </div>


            <h2>

              ${
                isOnline
                  ? "You're online"
                  : "You're offline"
              }

            </h2>


            <p class="sync-description">

              ${
                isOnline
                  ? 'Your connection is currently available.'
                  : 'Your surveys are safely stored on this device.'
              }

            </p>


            <div class="sync-card">


              <div class="sync-row">

                <span>
                  Pending surveys
                </span>

                <strong>
                  ${pendingCount}
                </strong>

              </div>


              <div class="sync-row">

                <span>
                  Synced surveys
                </span>

                <strong>
                  0
                </strong>

              </div>


              <div class="sync-row">

                <span>
                  Connection
                </span>

                <strong
                  class="${
                    isOnline
                      ? 'online-text'
                      : ''
                  }"
                >

                  ${
                    isOnline
                      ? 'Online'
                      : 'Offline'
                  }

                </strong>

              </div>


            </div>


            <div class="info-card">

              <i class="fa-solid fa-circle-info">
              </i>

              <p>

                ${
                  isOnline
                    ? 'Your survey records are stored locally and ready for synchronization.'
                    : 'You can continue creating surveys without an internet connection.'
                }

              </p>

            </div>


          </main>

        </div>

      `


      document
        .querySelector('#back-home')
        .addEventListener(
          'click',
          renderHome
        )

    }


    request.onerror = () => {

      console.error(
        'Failed to read sync data:',
        request.error
      )


      alert(
        'Could not load sync information.'
      )

    }


  } catch (error) {

    console.error(
      'IndexedDB error:',
      error
    )


    alert(
      'Could not open the local database.'
    )

  }

}


// ========================================
// START APPLICATION
// ========================================

renderHome()


// ========================================
// REGISTER SERVICE WORKER
// ========================================

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {

      console.log(
        'Service Worker registered'
      )

    })
    .catch((error) => {

      console.error(
        'Service Worker registration failed:',
        error
      )

    })

}