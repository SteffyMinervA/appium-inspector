import {DOMParser} from '@xmldom/xmldom';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import xpath from 'xpath';

import {addVendorPrefixes, getOptimalXPath, xmlToJSON} from '../../app/renderer/util';

const should = chai.should();
chai.use(chaiAsPromised);

// Helper that checks that the optimal xpath for a node is the one that we expect and also
// checks that the XPath successfully locates the node in it's doc
function testXPath(doc, node, expectedXPath) {
  getOptimalXPath(doc, node).should.equal(expectedXPath);
  xpath.select(expectedXPath, doc)[0].should.equal(node);
}

describe('util.js', function () {
  describe('#xmlToJSON', function () {
    it('should convert xml with unicode chars to json', function () {
      const json = xmlToJSON(`<hierarchy>
        <XCUIElementTypeApplication
          type="XCUIElementTypeApplication"
          name="🦋"
          label=""
          enabled="true"
          visible="true"
          x="0" y="0" width="768" height="1024">
            <XCUIElementTypeWindow
              type="XCUIElementTypeWindow"
              enabled="true"
              visible="false"
              x="0" y="0" width="1024" height="768">
            </XCUIElementTypeWindow>
        </XCUIElementTypeApplication>
      </hierarchy>`);
      json.should.eql({
        children: [
          {
            children: [
              {
                children: [],
                tagName: 'XCUIElementTypeWindow',
                attributes: {
                  type: 'XCUIElementTypeWindow',
                  enabled: 'true',
                  visible: 'false',
                  x: '0',
                  y: '0',
                  width: '1024',
                  height: '768',
                },
                xpath: '//XCUIElementTypeWindow',
                path: '0.0',
                classChain: '**/XCUIElementTypeWindow',
                predicateString: 'type == "XCUIElementTypeWindow"',
              },
            ],
            tagName: 'XCUIElementTypeApplication',
            attributes: {
              type: 'XCUIElementTypeApplication',
              name: '🦋',
              label: '',
              enabled: 'true',
              visible: 'true',
              x: '0',
              y: '0',
              width: '768',
              height: '1024',
            },
            xpath: '//XCUIElementTypeApplication[@name="🦋"]',
            path: '0',
            classChain: '',
            predicateString: '',
          },
        ],
        attributes: {},
        xpath: '/hierarchy',
        path: '',
        tagName: 'hierarchy',
        classChain: '**/hierarchy',
        predicateString: '',
      });
    });

    it('should convert xml to json for Android', function () {
      const json =
        xmlToJSON(`<hierarchy index="0" class="hierarchy" rotation="0" width="1080" height="2028">
        <android.widget.FrameLayout
            index="0"
            package="com.appiuminspector"
            class="android.widget.FrameLayout"
            text=""
            checkable="false"
            checked="false"
            clickable="false"
            enabled="true"
            focusable="false"
            focused="false"
            long-clickable="false"
            password="false"
            scrollable="false"
            selected="false"
            bounds="[0,0][1080,2028]"
            displayed="true">
          <android.widget.LinearLayout
            index="0"
            package="com.appiuminspector"
            class="android.widget.LinearLayout"
            text=""
            checkable="false"
            checked="false"
            clickable="false"
            enabled="true"
            focusable="false"
            focused="false"
            long-clickable="false"
            password="false"
            scrollable="false"
            selected="false"
            bounds="[0,0][1080,2028]"
            displayed="true">
           </android.widget.LinearLayout>
        </android.widget.FrameLayout>
      </hierarchy>`);
      json.should.eql({
        children: [
          {
            children: [
              {
                children: [],
                tagName: 'android.widget.LinearLayout',
                attributes: {
                  index: '0',
                  package: 'com.appiuminspector',
                  class: 'android.widget.LinearLayout',
                  text: '',
                  checkable: 'false',
                  checked: 'false',
                  clickable: 'false',
                  enabled: 'true',
                  focusable: 'false',
                  focused: 'false',
                  'long-clickable': 'false',
                  password: 'false',
                  scrollable: 'false',
                  selected: 'false',
                  bounds: '[0,0][1080,2028]',
                  displayed: 'true',
                },
                xpath: '//android.widget.LinearLayout',
                path: '0.0',
              },
            ],
            tagName: 'android.widget.FrameLayout',
            attributes: {
              index: '0',
              package: 'com.appiuminspector',
              class: 'android.widget.FrameLayout',
              text: '',
              checkable: 'false',
              checked: 'false',
              clickable: 'false',
              enabled: 'true',
              focusable: 'false',
              focused: 'false',
              'long-clickable': 'false',
              password: 'false',
              scrollable: 'false',
              selected: 'false',
              bounds: '[0,0][1080,2028]',
              displayed: 'true',
            },
            xpath: '//android.widget.FrameLayout',
            path: '0',
          },
        ],
        attributes: {
          class: 'hierarchy',
          height: '2028',
          rotation: '0',
          width: '1080',
          index: '0',
        },
        tagName: 'hierarchy',
        xpath: '/hierarchy',
        path: '',
      });
    });

    it('should convert xml to json and provide proper ios class chain and ios predicate string selectors', function () {
      const json = xmlToJSON(`<hierarchy>
        <XCUIElementTypeApplication type="XCUIElementTypeApplication" name="wdioDemoApp" label="wdioDemoApp" enabled="true" visible="true" x="0" y="0" width="414" height="896">
          <XCUIElementTypeWindow type="XCUIElementTypeWindow" enabled="true" visible="true" x="0" y="0" width="414" height="896">
            <XCUIElementTypeOther type="XCUIElementTypeOther" name="Appium Inspector" label="Appium Inspector" enabled="true" visible="true" x="0" y="0" width="414" height="896">
              <XCUIElementTypeOther type="XCUIElementTypeOther" name="Appium Inspector" label="Appium Inspector" enabled="true" visible="true" x="0" y="0" width="414" height="802">
                <XCUIElementTypeOther type="XCUIElementTypeOther" name="button-login-container" label="Login" enabled="true" visible="true" x="109" y="170" width="88" height="40">
                  <XCUIElementTypeOther type="XCUIElementTypeOther" name="Login" label="Login" enabled="true" visible="true" x="109" y="170" width="88" height="40">
                    <XCUIElementTypeStaticText type="XCUIElementTypeStaticText" value="Login" name="Login" label="Login" enabled="true" visible="true" x="124" y="175" width="58" height="30"/>
                  </XCUIElementTypeOther>
                </XCUIElementTypeOther>
              </XCUIElementTypeOther>
              <XCUIElementTypeOther type="XCUIElementTypeOther" name="Home WebView Login Forms Swipe" label="Home WebView Login Forms Swipe" enabled="true" visible="true" x="0" y="802" width="414" height="94">
                <XCUIElementTypeOther type="XCUIElementTypeOther" name="Home WebView Login Forms Swipe" label="Home WebView Login Forms Swipe" enabled="true" visible="true" x="0" y="802" width="414" height="94">
                  <XCUIElementTypeButton type="XCUIElementTypeButton" value="1" name="Login" label="Login" enabled="true" visible="true" x="165" y="812" width="84" height="50"/>
                </XCUIElementTypeOther>
              </XCUIElementTypeOther>
            </XCUIElementTypeOther>
          </XCUIElementTypeWindow>
          <XCUIElementTypeWindow type="XCUIElementTypeWindow" enabled="true" visible="false" x="0" y="0" width="414" height="896">
            <XCUIElementTypeOther type="XCUIElementTypeOther" enabled="true" visible="false" x="0" y="0" width="414" height="896">
              <XCUIElementTypeOther type="XCUIElementTypeOther" enabled="true" visible="false" x="0" y="0" width="414" height="896"/>
            </XCUIElementTypeOther>
          </XCUIElementTypeWindow>
        </XCUIElementTypeApplication>
      </hierarchy>`);
      json.should.eql({
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [],
                                    tagName: 'XCUIElementTypeStaticText',
                                    attributes: {
                                      type: 'XCUIElementTypeStaticText',
                                      value: 'Login',
                                      name: 'Login',
                                      label: 'Login',
                                      enabled: 'true',
                                      visible: 'true',
                                      x: '124',
                                      y: '175',
                                      width: '58',
                                      height: '30',
                                    },
                                    xpath: '//XCUIElementTypeStaticText[@name="Login"]',
                                    classChain: '**/XCUIElementTypeStaticText[`name == "Login"`]',
                                    predicateString:
                                      'name == "Login" AND label == "Login" AND value == "Login"',
                                    path: '0.0.0.0.0.0.0',
                                  },
                                ],
                                tagName: 'XCUIElementTypeOther',
                                attributes: {
                                  type: 'XCUIElementTypeOther',
                                  name: 'Login',
                                  label: 'Login',
                                  enabled: 'true',
                                  visible: 'true',
                                  x: '109',
                                  y: '170',
                                  width: '88',
                                  height: '40',
                                },
                                xpath: '//XCUIElementTypeOther[@name="Login"]',
                                classChain: '**/XCUIElementTypeOther[`name == "Login"`]',
                                predicateString:
                                  'name == "Login" AND label == "Login" AND type == "XCUIElementTypeOther"',
                                path: '0.0.0.0.0.0',
                              },
                            ],
                            tagName: 'XCUIElementTypeOther',
                            attributes: {
                              type: 'XCUIElementTypeOther',
                              name: 'button-login-container',
                              label: 'Login',
                              enabled: 'true',
                              visible: 'true',
                              x: '109',
                              y: '170',
                              width: '88',
                              height: '40',
                            },
                            xpath: '//XCUIElementTypeOther[@name="button-login-container"]',
                            classChain:
                              '**/XCUIElementTypeOther[`name == "button-login-container"`]',
                            predicateString: 'name == "button-login-container"',
                            path: '0.0.0.0.0',
                          },
                        ],
                        tagName: 'XCUIElementTypeOther',
                        attributes: {
                          type: 'XCUIElementTypeOther',
                          name: 'Appium Inspector',
                          label: 'Appium Inspector',
                          enabled: 'true',
                          visible: 'true',
                          x: '0',
                          y: '0',
                          width: '414',
                          height: '802',
                        },
                        xpath: '(//XCUIElementTypeOther[@name="Appium Inspector"])[2]',
                        classChain: '**/XCUIElementTypeOther[`name == "Appium Inspector"`][2]',
                        predicateString: '',
                        path: '0.0.0.0',
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [],
                                tagName: 'XCUIElementTypeButton',
                                attributes: {
                                  type: 'XCUIElementTypeButton',
                                  value: '1',
                                  name: 'Login',
                                  label: 'Login',
                                  enabled: 'true',
                                  visible: 'true',
                                  x: '165',
                                  y: '812',
                                  width: '84',
                                  height: '50',
                                },
                                xpath: '//XCUIElementTypeButton[@name="Login"]',
                                classChain: '**/XCUIElementTypeButton[`name == "Login"`]',
                                predicateString:
                                  'name == "Login" AND label == "Login" AND value == "1"',
                                path: '0.0.0.1.0.0',
                              },
                            ],
                            tagName: 'XCUIElementTypeOther',
                            attributes: {
                              type: 'XCUIElementTypeOther',
                              name: 'Home WebView Login Forms Swipe',
                              label: 'Home WebView Login Forms Swipe',
                              enabled: 'true',
                              visible: 'true',
                              x: '0',
                              y: '802',
                              width: '414',
                              height: '94',
                            },
                            xpath:
                              '(//XCUIElementTypeOther[@name="Home WebView Login Forms Swipe"])[2]',
                            classChain:
                              '**/XCUIElementTypeOther[`name == "Home WebView Login Forms Swipe"`][2]',
                            predicateString: '',
                            path: '0.0.0.1.0',
                          },
                        ],
                        tagName: 'XCUIElementTypeOther',
                        attributes: {
                          type: 'XCUIElementTypeOther',
                          name: 'Home WebView Login Forms Swipe',
                          label: 'Home WebView Login Forms Swipe',
                          enabled: 'true',
                          visible: 'true',
                          x: '0',
                          y: '802',
                          width: '414',
                          height: '94',
                        },
                        xpath:
                          '(//XCUIElementTypeOther[@name="Home WebView Login Forms Swipe"])[1]',
                        classChain:
                          '**/XCUIElementTypeOther[`name == "Home WebView Login Forms Swipe"`][1]',
                        predicateString: '',
                        path: '0.0.0.1',
                      },
                    ],
                    tagName: 'XCUIElementTypeOther',
                    attributes: {
                      type: 'XCUIElementTypeOther',
                      name: 'Appium Inspector',
                      label: 'Appium Inspector',
                      enabled: 'true',
                      visible: 'true',
                      x: '0',
                      y: '0',
                      width: '414',
                      height: '896',
                    },
                    xpath: '(//XCUIElementTypeOther[@name="Appium Inspector"])[1]',
                    classChain: '**/XCUIElementTypeOther[`name == "Appium Inspector"`][1]',
                    predicateString: '',
                    path: '0.0.0',
                  },
                ],
                tagName: 'XCUIElementTypeWindow',
                attributes: {
                  type: 'XCUIElementTypeWindow',
                  enabled: 'true',
                  visible: 'true',
                  x: '0',
                  y: '0',
                  width: '414',
                  height: '896',
                },
                xpath: '//XCUIElementTypeApplication[@name="wdioDemoApp"]/XCUIElementTypeWindow[1]',
                classChain: '**/XCUIElementTypeWindow[1]',
                predicateString: '',
                path: '0.0',
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [],
                        tagName: 'XCUIElementTypeOther',
                        attributes: {
                          type: 'XCUIElementTypeOther',
                          enabled: 'true',
                          visible: 'false',
                          x: '0',
                          y: '0',
                          width: '414',
                          height: '896',
                        },
                        xpath:
                          '//XCUIElementTypeApplication[@name="wdioDemoApp"]/XCUIElementTypeWindow[2]/XCUIElementTypeOther/XCUIElementTypeOther',
                        classChain:
                          '**/XCUIElementTypeWindow[2]/XCUIElementTypeOther/XCUIElementTypeOther',
                        predicateString: '',
                        path: '0.1.0.0',
                      },
                    ],
                    tagName: 'XCUIElementTypeOther',
                    attributes: {
                      type: 'XCUIElementTypeOther',
                      enabled: 'true',
                      visible: 'false',
                      x: '0',
                      y: '0',
                      width: '414',
                      height: '896',
                    },
                    xpath:
                      '//XCUIElementTypeApplication[@name="wdioDemoApp"]/XCUIElementTypeWindow[2]/XCUIElementTypeOther',
                    classChain: '**/XCUIElementTypeWindow[2]/XCUIElementTypeOther',
                    predicateString: '',
                    path: '0.1.0',
                  },
                ],
                tagName: 'XCUIElementTypeWindow',
                attributes: {
                  type: 'XCUIElementTypeWindow',
                  enabled: 'true',
                  visible: 'false',
                  x: '0',
                  y: '0',
                  width: '414',
                  height: '896',
                },
                xpath: '//XCUIElementTypeApplication[@name="wdioDemoApp"]/XCUIElementTypeWindow[2]',
                classChain: '**/XCUIElementTypeWindow[2]',
                predicateString: '',
                path: '0.1',
              },
            ],
            tagName: 'XCUIElementTypeApplication',
            attributes: {
              type: 'XCUIElementTypeApplication',
              name: 'wdioDemoApp',
              label: 'wdioDemoApp',
              enabled: 'true',
              visible: 'true',
              x: '0',
              y: '0',
              width: '414',
              height: '896',
            },
            xpath: '//XCUIElementTypeApplication[@name="wdioDemoApp"]',
            classChain: '',
            predicateString: '',
            path: '0',
          },
        ],
        attributes: {},
        classChain: '**/hierarchy',
        tagName: 'hierarchy',
        xpath: '/hierarchy',
        path: '',
        predicateString: '',
      });
    });
  });

  describe('#getOptimalXPath', function () {
    describe('on XML with height == 1', function () {
      it('should set an absolute xpath if attrName "id" is set', function () {
        const doc = new DOMParser().parseFromString(`<node id='foo'></node>`);
        testXPath(doc, doc.getElementById('foo'), '//node[@id="foo"]');
      });
      it('should set an absolute xpath if unique attributes is set to "content-desc" and that attr is set', function () {
        const doc = new DOMParser().parseFromString(`<node content-desc='foo'></node>`);
        testXPath(doc, doc.firstChild, '//node[@content-desc="foo"]');
      });
      it('should set relative xpath with tagname if no unique attributes are set', function () {
        const doc = new DOMParser().parseFromString(`<node non-unique-attr='foo'></node>`);
        testXPath(doc, doc.firstChild, '/node');
      });
    });
    describe('on XML with height == 2', function () {
      let doc;

      it('should set first child node to relative xpath with tagname if the child node has no siblings', function () {
        doc = new DOMParser().parseFromString(`<xml>
          <child-node non-unique-attr='hello'>Hello</child-node>
          <other-node>
            <child-node></child-node>
          </other-node>
        </xml>`);
        testXPath(doc, doc.getElementsByTagName('child-node')[0], '/xml/child-node');
      });

      it('should set first child node to relative xpath with tagname and index', function () {
        doc = new DOMParser().parseFromString(`<xml>
          <child-node non-unique-attr='hello'>Hello</child-node>
          <child-node non-unique-attr='world'>World</child-node>
        </xml>`);
        testXPath(doc, doc.getElementsByTagName('child-node')[0], '/xml/child-node[1]');
        testXPath(doc, doc.getElementsByTagName('child-node')[1], '/xml/child-node[2]');
      });
      it('should set first child node to absolute xpath if it has ID set', function () {
        doc = new DOMParser().parseFromString(`<xml>
          <child-node content-desc='hello'>Hello</child-node>
          <child-node content-desc='world'>World</child-node>
        </xml>`);
        testXPath(
          doc,
          doc.getElementsByTagName('child-node')[0],
          '//child-node[@content-desc="hello"]',
        );
        testXPath(
          doc,
          doc.getElementsByTagName('child-node')[1],
          '//child-node[@content-desc="world"]',
        );
      });
      it('should index children based on tagName', function () {
        doc = new DOMParser().parseFromString(`<xml>
          <child>Hello</child>
          <child-node>World</child-node>
          <child>Foo</child>
          <child-node>Bar</child-node>
        </xml>`);
        testXPath(doc, doc.getElementsByTagName('child')[0], '/xml/child[1]');
        testXPath(doc, doc.getElementsByTagName('child')[1], '/xml/child[2]');
        testXPath(doc, doc.getElementsByTagName('child-node')[0], '/xml/child-node[1]');
        testXPath(doc, doc.getElementsByTagName('child-node')[1], '/xml/child-node[2]');

        doc = new DOMParser().parseFromString(`<xml>
          <child>Hello</child>
          <child-node>World</child-node>
          <other-child-node>asdfasdf</other-child-node>
          <child-node>Bar</child-node>
        </xml>`);
        testXPath(doc, doc.getElementsByTagName('child')[0], '//child');
        testXPath(doc, doc.getElementsByTagName('child-node')[0], '/xml/child-node[1]');
        testXPath(doc, doc.getElementsByTagName('child-node')[1], '/xml/child-node[2]');
        testXPath(doc, doc.getElementsByTagName('other-child-node')[0], '//other-child-node');
      });
    });
    describe('on XML with height = 3', function () {
      let doc;
      it('should use child as absolute and relative grandchild path if child has an ID set', function () {
        doc = new DOMParser().parseFromString(`<root>
          <child id='foo'>
            <grandchild>Hello</grandchild>
            <grandchild>World</grandchild>
          </child>
        </root>`);
        testXPath(
          doc,
          doc.getElementsByTagName('grandchild')[0],
          '//child[@id="foo"]/grandchild[1]',
        );
        testXPath(
          doc,
          doc.getElementsByTagName('grandchild')[1],
          '//child[@id="foo"]/grandchild[2]',
        );
      });
      it('should use indexes of children and grandchildren if no IDs are set', function () {
        doc = new DOMParser().parseFromString(`<root>
          <child>
            <grandchild>Hello</grandchild>
            <grandchild>World</grandchild>
          </child>
          <irrelevant-child></irrelevant-child>
          <child>
            <grandchild>Foo</grandchild>
            <grandchild>Bar</grandchild>
          </child>
        </root>`);
        testXPath(doc, doc.getElementsByTagName('grandchild')[0], '/root/child[1]/grandchild[1]');
        testXPath(doc, doc.getElementsByTagName('grandchild')[1], '/root/child[1]/grandchild[2]');
        testXPath(doc, doc.getElementsByTagName('grandchild')[2], '/root/child[2]/grandchild[1]');
        testXPath(doc, doc.getElementsByTagName('grandchild')[3], '/root/child[2]/grandchild[2]');
      });
      it("should use indices if the unique attribute isn't actually unique", function () {
        doc = new DOMParser().parseFromString(`<root>
          <child id='foo'>
            <grandchild>Foo</grandchild>
            <grandchild>Bar</grandchild>
          </child>
          <child id='foo'>
            <grandchild>Hello</grandchild>
          </child>
          <child id='foo'></child>
          <another-child>Irrelevant</another-child>
          <another-child>Irrelevant</another-child>
          <child id='foo'>
            <grandchild></grandchild>
            <child id='foo'>
              <great-grand-child></great-grand-child>
            </child>
          </child>
        </root>`);
        const grandchildren = doc.getElementsByTagName('grandchild');
        testXPath(doc, grandchildren[0], '(//child[@id="foo"])[1]/grandchild[1]');
        testXPath(doc, grandchildren[1], '(//child[@id="foo"])[1]/grandchild[2]');
        testXPath(doc, grandchildren[2], '(//child[@id="foo"])[2]/grandchild');
        testXPath(doc, grandchildren[3], '(//child[@id="foo"])[4]/grandchild');

        const greatgrandchildren = doc.getElementsByTagName('great-grand-child');
        testXPath(doc, greatgrandchildren[0], '//great-grand-child');

        const children = doc.getElementsByTagName('child');
        testXPath(doc, children[0], '(//child[@id="foo"])[1]');
        testXPath(doc, children[1], '(//child[@id="foo"])[2]');
        testXPath(doc, children[2], '(//child[@id="foo"])[3]');
        testXPath(doc, children[3], '(//child[@id="foo"])[4]');
        testXPath(doc, children[4], '(//child[@id="foo"])[5]');
      });
      it('should return conjunctively unique xpath locators if they exist', function () {
        doc = new DOMParser().parseFromString(`<root>
          <child id='foo' text='bar'></child>
          <child text='yo'></child>
          <child id='foo' text='yo'></child>
          <child id='foo'></child>
          <child text='zoom'></child>
          <child id='bar' text='ohai'></child>
          <child id='bar' text='ohai'></child>
        </root>`);
        const children = doc.getElementsByTagName('child');
        testXPath(doc, children[0], '//child[@id="foo" and @text="bar"]');
        testXPath(doc, children[1], '(//child[@text="yo"])[1]');
        testXPath(doc, children[2], '//child[@id="foo" and @text="yo"]');
        testXPath(doc, children[3], '(//child[@id="foo"])[3]');
        testXPath(doc, children[4], '//child[@text="zoom"]');
        testXPath(doc, children[5], '(//child[@id="bar"])[1]');
        testXPath(doc, children[6], '(//child[@id="bar"])[2]');
      });
    });

    describe('when exceptions are thrown', function () {
      it('should keep going if xpath.select throws an exception', function () {
        const xpathSelectStub = sinon.stub(xpath, 'select').callsFake(() => {
          throw new Error('Exception');
        });
        const doc = new DOMParser().parseFromString(`<node id='foo'>
          <child id='a'></child>
          <child id='b'>
            <grandchild id='hello'></grandchild>
          </child>
        </node>`);
        getOptimalXPath(doc, doc.getElementById('hello'), ['id']).should.equal(
          '/node/child[2]/grandchild',
        );
        xpathSelectStub.restore();
      });

      it('should return undefined if anything else throws an exception', function () {
        const doc = new DOMParser().parseFromString(`<node id='foo'>
          <child id='a'></child>
          <child id='b'>
            <grandchild id='hello'></grandchild>
          </child>
        </node>`);
        const node = doc.getElementById('hello');
        node.getAttribute = () => {
          throw new Error('Some unexpected error');
        };
        should.not.exist(getOptimalXPath(doc, node, ['id']));
      });
    });
  });

  describe('#addVendorPrefixes', function () {
    it('should convert unprefixed non-standard caps to use appium prefix', function () {
      const caps = [{name: 'udid'}, {name: 'deviceName'}];
      addVendorPrefixes(caps).should.eql([{name: 'appium:udid'}, {name: 'appium:deviceName'}]);
    });

    it('should not convert already-prefixed or standard caps', function () {
      const caps = [{name: 'udid'}, {name: 'browserName'}, {name: 'goog:chromeOptions'}];
      addVendorPrefixes(caps).should.eql([
        {name: 'appium:udid'},
        {name: 'browserName'},
        {name: 'goog:chromeOptions'},
      ]);
    });
  });
});
