import { mapState, mapGetters } from 'vuex'
import BasicUserCard from '../basic_user_card/basic_user_card.vue'
import UserAvatar from '../user_avatar/user_avatar.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faSearch,
  faChevronLeft
)

const ListNew = {
  components: {
    BasicUserCard,
    UserAvatar
  },
  data () {
    return {
      title: '',
      suggestions: [],
      userIds: [],
      selectedUserIds: [],
      loading: false,
      query: ''
    }
  },
  created () {
    this.$store.state.api.backendInteractor.getList({ id: this.id })
      .then((data) => { this.title = data.title })
    this.$store.state.api.backendInteractor.getListAccounts({ id: this.id })
      .then((data) => { this.selectedUserIds = data })
  },
  computed: {
    id () {
      return this.$route.params.id
    },
    users () {
      return this.userIds.map(userId => this.findUser(userId))
    },
    availableUsers () {
      if (this.query.length !== 0) {
        return this.users
      } else {
        return this.suggestions
      }
    },
    ...mapState({
      currentUser: state => state.users.currentUser,
      backendInteractor: state => state.api.backendInteractor
    }),
    ...mapGetters(['findUser'])
  },
  methods: {
    onInput () {
      this.search(this.query)
    },
    selectUser (user, event) {
      if (this.selectedUserIds.includes(user.id)) {
        this.removeUser(user.id)
        event.target.classList.remove('selected')
      } else {
        this.addUser(user)
        event.target.classList.add('selected')
      }
    },
    addUser (user) {
      this.selectedUserIds.push(user.id)
    },
    removeUser (userId) {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId)
    },
    search (query) {
      if (!query) {
        this.loading = false
        return
      }

      this.loading = true
      this.userIds = []
      this.$store.dispatch('search', { q: query, resolve: true, type: 'accounts', following: true })
        .then(data => {
          this.loading = false
          this.userIds = data.accounts.map(a => a.id)
        })
    },
    updateList () {
      // the API has two different endpoints for "updating the list name" and
      // "updating the accounts on the list".
      this.$store.state.api.backendInteractor.updateList({ id: this.id, title: this.title })
      this.$store.state.api.backendInteractor.addAccountsToList({
        id: this.id, accountIds: this.selectedUserIds
      }).then(() => {
        this.$router.push({ name: 'list-timeline', params: { id: this.id } })
      })
    },
    deleteList () {
      this.$store.state.api.backendInteractor.deleteList({ id: this.id })
        .then(this.$router.push({ name: 'lists' }))
    }
  }
}

export default ListNew
