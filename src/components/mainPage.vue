  <template>
  <div>
    <nav class="navbar">
      <div class="nav-contents container">
        <div class="row w-100">
          <div class="col-5">
            <img src="../assets/logo-white.png" class="float-left" style="width: 120px;">
          </div>
          <div class="col-2">
            <div style="width: 7em;">
              <button class="btn btn-test btn-block float-right" @click="profilePage">Profile View</button>
            </div>
          </div>
          <div class="col-3 px-0">
            <span class="fa-stack fa-5x has-badge ml-auto" :data-count="tradeOffers.length">
              <button class="btn btn-test ml-auto pending-btn float-right" @click="tradeView">Pending Trades</button>
              <pending-trades ref="pendingTrades" v-bind="$props" :tradeOffers='tradeOffers'></pending-trades>
            </span>
          </div>
          <div class="col-2">
            <button class="btn btn-test signout float-right" @click="auth.logout">Sign Out</button>
          </div>
          <div class="dropdown">
            <b-dropdown id="ddown2" :text="selectedCategory" class="m-md-2">
              <div class="scrollable-menu">
                <b-dropdown-item v-for="(category,index) in categories" :category='category' :key='index' @click="dropdownClick(category)">{{ category.name }}</b-dropdown-item>
              </div>
            </b-dropdown>
          </div>
        </div>
      </div>
    </nav>
    <div class="container main-container">
        <b-modal ref="itemModal" :class="'item-modal-view'">
          <div slot="modal-header" class="w-100">
            <button class="close float-right" @click="hide">&times;</button>
            <h4 class="modal-title float-left">Your Stash</h4>
          </div>
          <b-form @submit="acceptTradeItem">
          <div slot="modal-body" class="container-fluid item-offers">
              <div v-for="(item,index) in profileItems" :key='index' class="card m-1 w-100" style="border-style: outset; height: 5rem;">
                <h5 class="card-title text-left m-1">{{item.name}}</h5>
                <div class="row">
                  <div class="col">
                    <p class="text-left ml-1" style="height: 3rem; overflow: hidden;">{{item.description}}
                    </p>
                  </div>
                  <div class="col-3 mr-2">
                    <b-form-checkbox v-model="offeredItems" :id="`${item.id}`" :value="item.id">Offer?</b-form-checkbox>
                  </div>
                </div>
              </div>          
          </div>
            </b-form>
            <div slot="modal-footer" class="w-100">
              <b-btn class="float-left" variant="primary" @click="hide">Close</b-btn>
              <b-button @click="acceptTradeItem" type="reset" variant="primary" class="btn btn-primary float-right">Offer Items</b-button>
            </div>
        </b-modal>
        <div class="card inner-container p-2">
            <div style="height: 3rem;"></div>
            <div class="container-fluid">          
              <div class="row">
                <div class="col-12 pb-3" style="min-height: 14rem;">
                  <div class="item-card card px-0 w-100 h-100" style="border-style: outset;">
                    <div class="card-block px-0">
                      <img v-b-popover.hover.bottom="currentTradeItem.description" :title="currentTradeItem.name" class="trade-photo rounded" v-bind:src="categoryPic"/>
                      <h2 class="card-title">{{currentTradeItem.name}}</h2>
                    </div>
                  </div>
                </div>
                <div class="col order-2 my-1 align-self-center">
                  <button class="btn-warning btn-lg" @click="rejectTradeItem">No Thanks</button>
                </div>
                <div class="col order-3 my-1 align-self-center">
                  <button class="btn-success btn-lg" @click="show">Let's Trade!</button>
                </div>
              </div>
            </div>
        </div>
    </div>
    <!-- <nav class="navbar" style="position: absolute; bottom: 0; height: 3em;">
      <div class="nav-contents container">
        <h6 class="created-by pt-1">Created by HoneyBadgerHackers</h6>
      </div>
    </nav> -->
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'mainPage',
  props: ['auth', 'authentication', 'userId', 'categories'],
  data() {
    return {
      selectedCategory: 'Categories',
      categoryId: null,
      currentTradeItem: {},
      profileItems: [],
      tradeOffers: [],
      offeredItems: [],
      categoryPic: '',
    };
  },
  methods: {
    getUserItems() {
      const config = {
        headers: {
          id_user: this.userId,
        },
      };
      return axios.get('/items', config)
      .then(({ data: userItems }) => {
        this.profileItems = userItems;
      })
      .catch(err => console.error(err));
    },
    getCategories() {
      axios.get('/categories')
      .then(({ data: categories }) => {
        this.categories = categories;
      })
      .catch((error) => {
        console.error(error);
      });
    },
    dropdownClick({ id, name }) {
      this.selectedCategory = name;
      this.categoryId = id;
      // console.log(this.categoryId);
    },
    getTradeOffers() {
      if (!this.profileItems.length) {
        return;
      }
      const config = {
        headers: {
          id: this.userId,
          items: this.profileItems.map(item => item.id),
        },
      };
      axios.get('/users', config)
        .then((items) => {
          const sorted = items.data.map((offer) => {
            if (offer.id_user.toString() === this.userId) {
              return { myItem: offer.offered, theirItem: offer.desired };
            }
            return { myItem: offer.desired, theirItem: offer.offered };
          });
          this.tradeOffers = sorted;
        });
    },
    getSortedItem() {
      const config = {
        headers: {
          id_user: this.userId,
          id_category: this.categoryId,
          items: this.profileItems.map(item => item.id),
        },
      };
      // console.log('sorted');
      axios.get('/sorted', config)
      .then(({ data: tradeItem }) => {
        if (typeof tradeItem === 'string') {
          const noItemResponse = {
            name: 'Sorry!',
            description: 'No more trade items can be found at this time, check back later or select "No Thanks" to refresh',
            id: null,
          };
          this.currentTradeItem = noItemResponse;
          this.categoryPic = 'http://www.clker.com/cliparts/A/x/z/U/T/p/no-trade-md.png';
        } else {
          this.currentTradeItem = tradeItem;
          if (tradeItem.url_img) {
            this.categoryPic = tradeItem.url_img;
          } else {
            this.getCategoryPic();
          }
        }
        this.getTradeOffers();
      });
    },
    getTradeItem() {
      const config = {
        headers: {
          id_user: this.userId,
          items: this.profileItems.map(item => item.id),
        },
      };
      // console.log('unsorted');
      axios.get('/transactions', config)
      .then(({ data: tradeItem }) => {
        if (typeof tradeItem === 'string') {
          const noItemResponse = {
            name: 'Sorry!',
            description: 'No more trade items can be found at this time, check back later or select "No Thanks" to refresh',
            id: null,
          };
          this.currentTradeItem = noItemResponse;
          this.categoryPic = 'http://www.clker.com/cliparts/A/x/z/U/T/p/no-trade-md.png';
        } else {
          this.currentTradeItem = tradeItem;
          if (tradeItem.url_img) {
            this.categoryPic = tradeItem.url_img;
          } else {
            this.getCategoryPic();
          }
        }
        this.getTradeOffers();
      });
    },
    show() {
      this.$refs.itemModal.show();
    },
    hide() {
      this.$refs.itemModal.hide();
    },
    profilePage() {
      this.$router.push({ path: '/profile' });
    },
    ready() {
      this.getUserItems(this.userId);
    },
    tradeView() {
      this.$refs.pendingTrades.show();
    },
    rejectTradeItem() {
      // console.log('reject');
      if (!this.currentTradeItem.id) {
        this.offeredItems = [];
        this.hide();
        return;
      }
      const config = { data: [
        {
          id_user: this.userId,
          id_item_offered: this.currentTradeItem.id,
          id_item_desired: this.currentTradeItem.id,
          cat: this.cat,
          pending: false,
          accepted: false,
        },
      ] };
      axios.post('/transactions', config)
      .then(() => {
        this.offeredItems = [];
        // console.log(this.categoryId);
        if (this.categoryId === null) {
          this.getTradeItem();
        } else {
          this.getSortedItem();
        }
        this.hide();
      })
      .catch((error) => {
        console.error(error);
      });
    },
    acceptTradeItem() {
      if (!this.currentTradeItem.id) {
        this.offeredItems = [];
        this.hide();
        return;
      }
      const userItemsArray = this.offeredItems.map((item) => {
        const config = {
          id_user: this.userId,
          id_item_offered: item,
          id_item_desired: this.currentTradeItem.id,
          pending: true,
        };
        return config;
      });
      const config = { data: userItemsArray };
      axios.post('/transactions', config)
      .then(() => {
        this.offeredItems = [];
        if (this.categoryId === null) {
          this.getTradeItem();
        } else {
          this.getSortedItem();
        }
        this.hide();
      })
      .catch((error) => {
        console.error(error);
      });
    },
    getCategoryPic() {
      const categoryId = this.currentTradeItem.id_category;
      if (categoryId) {
        const categoryPicArray = this.categories.filter(category => categoryId === category.id)[0].url_img.split('cats');
        this.categoryPic = `../static/cats${categoryPicArray[1]}`;
      } else {
        this.categoryPic = 'https://vignette.wikia.nocookie.net/xmenmovies/images/7/7c/Deadpool_%28Thumbs_Up_-_Transparent%29.png/revision/latest/scale-to-width-down/350?cb=20170324222613';
      }
    },
  },
  mounted() {
    this.getUserItems()
    .then(() => {
      if (this.categoryId === null) {
        this.getTradeItem();
      } else {
        this.getSortedItem();
      }
    })
    .then(this.getTradeOffers);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}

.well * {
  display: inline-block;
}

.modal-body {
  max-height: 70vh;
  overflow-y: scroll;
}

.trade-photo {
  width: 36.7rem;
  height: 27rem;
  object-fit: cover;
}

.btn {
  margin: 1px;
}

li {
  display: inline-block;
}

img {
  width: 100%
}

</style>
