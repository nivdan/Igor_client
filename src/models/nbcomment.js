import htmlToText from 'html-to-text'
import axios from 'axios'
import {VisibilityMap, AnonymityMap} from './enums'

class NbComment {
  constructor(id, range, parent, timestamp, author, authorName, html,
      hashtagsUsed, usersTagged, visibility, anonymity, replyRequestedByMe,
      replyRequestCount, starredByMe, starCount, seenByMe) {
    this.id = id
    this.range = range // null if this is a reply

    this.parent = parent // null if this is the head of thread
    this.children = []

    this.timestamp = timestamp
    this.author = author
    this.authorName = authorName

    this.html = html

    this.hashtags = hashtagsUsed
    this.people = usersTagged

    this.visibility = visibility
    this.anonymity = anonymity

    this.replyRequestedByMe = replyRequestedByMe
    this.replyRequestCount = replyRequestCount

    this.starredByMe = starredByMe
    this.starCount = starCount

    this.seenByMe = seenByMe

    if (this.html.includes('ql-formula')) { // work around for latex formula
      let temp = document.createElement('div')
      temp.innerHTML = this.html
      for (let formula of temp.querySelectorAll('span.ql-formula')) {
        let span = document.createElement('span')
        span.textContent = formula.getAttribute('data-value')
        formula.parentNode.replaceChild(span, formula)
      }
      this.text = temp.textContent
    } else {
      this.text = htmlToText.fromString(this.html, { wordwrap: false })
    }
    console.log(this);
    console.log(this.range.serialize());
  }

  submitAnnotation(){
    if(!this.parent){
      return axios.post('/api/annotations/annotation', {
        url: window.location.href.split('?')[0],
        content: this.html,
        range: this.range.serialize(),
        author: this.author,
        tags: this.hashtags,
        userTags: this.people,
        visibility: VisibilityMap[this.visibility],
        anonymity: AnonymityMap[this.anonymity],
        replyRequest: this.replyRequestedByMe,
        star: this.starredByMe
      }).then((res) => {
        this.id = res.data.id;
      });
    }
  }

  countAllReplies() {
    let total = this.children.length
    for (let child of this.children) {
      total += child.countAllReplies()
    }
    return total
  }

  countAllReplyRequests() {
    let total = this.replyRequestCount
    for (let child of this.children) {
      total += child.countAllReplyRequests()
    }
    return total
  }

  countAllStars() {
    let total = this.starCount
    for (let child of this.children) {
      total += child.countAllStars()
    }
    return total
  }

  hasText(text) {
    if (this.text.includes(text)) {
      return true
    }
    for (let child of this.children) {
      if (child.hasText(text)) {
        return true
      }
    }
    return false
  }

  hasHashtag(hashtag) {
    if (this.hashtags.includes(hashtag)) {
      return true
    }
    for (let child of this.children) {
      if (child.hasHashtag(hashtag)) {
        return true
      }
    }
    return false
  }

  toggleStar() {
    if (this.starredByMe) {
      this.starCount -= 1
      this.starredByMe = false
    } else {
      this.starCount += 1
      this.starredByMe = true
    }
    // TODO: Also async update backend
  }

  toggleReplyRequest() {
    if (this.replyRequestedByMe) {
      this.replyRequestCount -= 1
      this.replyRequestedByMe = false
    } else {
      this.replyRequestCount += 1
      this.replyRequestedByMe = true
    }
    // TODO: async update backend
  }
}

export default NbComment