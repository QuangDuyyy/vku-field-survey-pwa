export const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open("VKUFieldSurveyDB", 3)

  request.onupgradeneeded = (event) => {
    const db = event.target.result

    if (!db.objectStoreNames.contains("surveys")) {
      db.createObjectStore("surveys", {
        keyPath: "id",
      })
    }
  }

  request.onsuccess = () => {
    resolve(request.result)
  }

  request.onerror = () => {
    reject(request.error)
  }
})


console.log("DB FILE IS RUNNING")

export function getAllSurveys() {
  return dbPromise.then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("surveys", "readonly")
      const store = transaction.objectStore("surveys")

      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  })
}

// ========================================
// DELETE SURVEY
// ========================================

export function deleteSurvey(id) {

  return dbPromise.then((db) => {

    return new Promise((resolve, reject) => {

      const transaction =
        db.transaction(
          'surveys',
          'readwrite'
        )

      const store =
        transaction.objectStore(
          'surveys'
        )


      const request =
        store.delete(id)


      request.onsuccess = () => {

        console.log(
          'Survey deleted:',
          id
        )

        resolve()

      }


      request.onerror = () => {

        console.error(
          'Failed to delete survey:',
          request.error
        )

        reject(request.error)

      }

    })

  })

}
// ========================================
// SAVE / UPDATE SURVEY
// ========================================

export function saveSurvey(survey) {
  return dbPromise.then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        "surveys",
        "readwrite"
      )

      const store =
        transaction.objectStore("surveys")

      const request = store.put(survey)

      request.onsuccess = () => {
        console.log(
          "Survey saved:",
          survey.id
        )
        resolve()
      }

      request.onerror = () => {
        console.error(
          "Failed to save survey:",
          request.error
        )
        reject(request.error)
      }
    })
  })
}